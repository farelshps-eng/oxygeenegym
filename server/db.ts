import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'oxygen.sqlite');
const BACKUP_FILE = path.join(DATA_DIR, 'members_backup.json');

let dbInstance: Database | null = null;

// Clean invisible and RTL Unicode characters
export function cleanInvisibleChars(str?: string): string {
  if (!str) return '';
  return str
    .toString()
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u061C]/g, '')
    .trim();
}

// Convert Eastern Arabic digits (٠-٩) to Western (0-9)
export function convertArabicIndicToWestern(str?: string): string {
  if (!str) return '';
  const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  let res = str.toString();
  for (let i = 0; i < 10; i++) {
    res = res.split(arabicDigits[i]).join(i.toString());
  }
  return res;
}

// Normalizes Libyan phone numbers and converts Arabic-Indic numerals
export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  let str = cleanInvisibleChars(raw);
  str = convertArabicIndicToWestern(str);
  // Remove spaces, dashes, dots, brackets, plus signs
  let cleaned = str.replace(/[\s\-\(\)\.\+]/g, '');
  if (cleaned.startsWith('00218')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('218') && cleaned.length >= 10) {
    cleaned = '0' + cleaned.slice(3);
  }
  // Standard Libyan mobile without 0: e.g. 91xxxxxxx (9 digits) -> 091xxxxxxx (10 digits)
  if (cleaned.length === 9 && (cleaned.startsWith('9') || cleaned.startsWith('2'))) {
    cleaned = '0' + cleaned;
  }
  return cleaned.trim();
}

// Convert any undefined values to null for sql.js parameter safety
export function cleanSqlParams(params: any[] = []): any[] {
  return params.map(p => (p === undefined ? null : p));
}

// Synchronously or asynchronously initialize SQLite
export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema
  initSchema(dbInstance);
  migrateLegacyImagePaths(dbInstance);
  saveDb();

  return dbInstance;
}

function migrateLegacyImagePaths(db: Database) {
  const replacements: [string, string][] = [
    ['hero_oxygen_gym_1790856807220', '/images/hero.svg'],
    ['equipment_power_racks_1790856826759', '/images/equipment.svg'],
    ['training_boxing_area_1790856839534', '/images/training.svg'],
    ['trainers_coaching_team_1791128151134', '/images/trainers.svg'],
    ['facilities_luxury_gym_1790856853986', '/images/facilities.svg'],
    ['products_nutrition_showcase_1790856864933', '/images/products.svg'],
  ];
  for (const [fragment, target] of replacements) {
    const like = `%${fragment}%`;
    db.run(`UPDATE site_settings SET value = ? WHERE key = 'hero_image' AND value LIKE ?`, [target, like]);
    for (const col of ['image_url', 'photo_url', 'cover_image'] as const) {
      for (const table of ['equipment', 'training', 'trainers', 'facilities', 'news', 'products', 'memberships']) {
        try {
          db.run(`UPDATE ${table} SET ${col} = ? WHERE ${col} LIKE ?`, [target, like]);
        } catch {
          /* column may not exist on table */
        }
      }
    }
  }
  db.run(`UPDATE site_settings SET value = '/images/hero.svg' WHERE key = 'hero_image' AND value LIKE '/src/assets/%'`);
}

export function saveDb() {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);

    // Save persistent JSON backup of registered members
    try {
      const stmt = dbInstance.prepare("SELECT * FROM members ORDER BY id ASC");
      const members: any[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        delete row.password_hash;
        members.push(row);
      }
      stmt.free();
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(members, null, 2), 'utf8');
    } catch (e) {
      // non-fatal backup error
    }
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

export function syncMembersRegistry() {
  saveDb();
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS equipment_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      category_id INTEGER,
      category_name TEXT,
      manufacturer TEXT,
      model TEXT,
      target_muscles TEXT,
      usage_level TEXT,
      instructions TEXT,
      display_order INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS training_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS training (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER,
      category_name TEXT,
      difficulty TEXT,
      image_url TEXT,
      gallery_json TEXT DEFAULT '[]',
      is_published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      photo_url TEXT,
      specialty TEXT,
      bio TEXT,
      experience TEXT,
      training_types_json TEXT DEFAULT '[]',
      gallery_json TEXT DEFAULT '[]',
      display_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      price REAL DEFAULT 0,
      currency TEXT DEFAULT 'LYD',
      duration TEXT NOT NULL,
      features_json TEXT DEFAULT '[]',
      description TEXT,
      trainer_id INTEGER,
      image_url TEXT,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      category TEXT,
      display_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      cover_image TEXT,
      content TEXT,
      category_id INTEGER,
      category_name TEXT,
      author TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      price REAL DEFAULT 0,
      currency TEXT DEFAULT 'LYD',
      category_id INTEGER,
      category_name TEXT,
      availability_status TEXT DEFAULT 'متوفر',
      external_info_url TEXT,
      is_featured INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT,
      url TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      age INTEGER,
      is_subscribed INTEGER DEFAULT 0,
      plan_name TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      fitness_goal TEXT,
      notes TEXT,
      last_renewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trainer_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      trainer_id INTEGER,
      trainer_name TEXT NOT NULL,
      sender_type TEXT NOT NULL DEFAULT 'trainer', -- 'trainer' or 'member'
      message_type TEXT DEFAULT 'chat', -- 'chat' or 'workout_plan' or 'nutrition_plan'
      title TEXT,
      content TEXT NOT NULL,
      plan_details_json TEXT DEFAULT '{}',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Update or seed 3 official management & trainer accounts with password '112233'
  const salt = bcrypt.genSaltSync(10);
  const hash112233 = bcrypt.hashSync('112233', salt);

  const initialUsers = [
    { username: 'admin', email: 'admin@oxygengym.ly', role: 'admin' },
    { username: 'manager', email: 'manager@oxygengym.ly', role: 'admin' },
    { username: 'waleed', email: 'waleed@oxygengym.ly', role: 'trainer' },
    { username: 'ali', email: 'ali@oxygengym.ly', role: 'trainer' },
  ];

  for (const u of initialUsers) {
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    checkStmt.bind([u.username]);
    const exists = checkStmt.step();
    checkStmt.free();
    if (!exists) {
      db.run(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [u.username, u.email, hash112233, u.role]
      );
    }
  }

  const waleedCheck = db.exec("SELECT id FROM trainers WHERE slug = 'coach-waleed'");
  if (!waleedCheck.length || waleedCheck[0].values.length === 0) {
    db.run(`
      INSERT INTO trainers (id, name, slug, photo_url, specialty, bio, experience, training_types_json, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1,
      'كابتن وليد (مدير الجيم والمدرب العام)',
      'coach-waleed',
      '/images/trainers.svg',
      'مدير الصالة وكبير المدربين المعتمدين - خبير الإعداد البدني وبناء الأجسام',
      'مدير صالة أوكسجين جيم والمشرف العام على متابعة المشتركين وتصميم البرامج التدريبية الاحترافية والتغذية الرياضية والاستشفاء العضلي.',
      '15 عاماً خبرة',
      JSON.stringify(['بناء أجسام وضخامة عضلية', 'إعداد بدني شامل', 'تأهيل رياضي']),
      1,
      1
    ]);
  }

  const aliCheck = db.exec("SELECT id FROM trainers WHERE slug = 'coach-ali'");
  if (!aliCheck.length || aliCheck[0].values.length === 0) {
    db.run(`
      INSERT INTO trainers (id, name, slug, photo_url, specialty, bio, experience, training_types_json, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      2,
      'كابتن علي (مدرب اللياقة وبناء الأجسام)',
      'coach-ali',
      '/images/trainers.svg',
      'مدرب معتمد في كمال الأجسام واللياقة البدنية والتنشيف العضلي',
      'مدرب متخصص في تمارين المقاومة والأوزان الحرة وبرامج حرق الدهون وبناء القوة والكتلة العضلية للمشتركين ومتابعة الأوزان أسبوعياً.',
      '10 أعوام خبرة',
      JSON.stringify(['فنون قتالية وملاكمة', 'تمارين مقاومة وأثقال', 'تنشيف وخسارة دهون']),
      1,
      2
    ]);
  }

  // Restore any real members from JSON backup file if exists
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf8');
      const backupMembers = JSON.parse(backupRaw);
      if (Array.isArray(backupMembers) && backupMembers.length > 0) {
        for (const bm of backupMembers) {
          if (!bm.phone) continue;
          const cleanP = normalizePhone(bm.phone);
          const checkStmt = db.prepare("SELECT id FROM members WHERE phone = ? OR phone = ?");
          checkStmt.bind([cleanP, bm.phone]);
          const hasMember = checkStmt.step();
          checkStmt.free();
          if (!hasMember) {
            db.run(`
              INSERT OR REPLACE INTO members (
                id, full_name, email, phone, password_hash, age, is_subscribed,
                plan_name, start_date, end_date, status, fitness_goal, notes, last_renewed_at, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              bm.id, bm.full_name, bm.email || null, cleanP || bm.phone, bm.password_hash || bcrypt.hashSync('change-me', 10), bm.age || null,
              bm.is_subscribed ? 1 : 0, bm.plan_name || null, bm.start_date || null, bm.end_date || null,
              bm.status || 'active', bm.fitness_goal || null, bm.notes || null, bm.last_renewed_at || null,
              bm.created_at || new Date().toISOString()
            ]);
          }
        }
      }
    } catch (e) {
      // non-fatal
    }
  }

  // Seed default site settings if empty
  const settingsCheck = db.exec("SELECT count(*) as count FROM site_settings");
  const count = (settingsCheck[0]?.values[0]?.[0] as number) || 0;
  if (count === 0) {
    const defaultSettings: Record<string, string> = {
      gym_name: 'OXYGEN GYM',
      gym_name_ar: 'أوكسجين جيم',
      tagline: 'تنفّس القوة. اصنع الفرق.',
      description: 'كل ما تحتاجه لتدريب أقوى، لياقة أفضل، ورحلة مستمرة نحو أهدافك في طرابلس - طريق عين زارة.',
      address: 'طريق عين زارة، طرابلس، ليبيا',
      plus_code: 'R84G+X2P',
      google_maps_url: 'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya',
      phone: '+218 91 123 4567',
      whatsapp: '+218 91 123 4567',
      email: 'info@oxygengym.ly',
      hero_title: 'تنفّس القوة. اصنع الفرق.',
      hero_description: 'كل ما تحتاجه لتدريب أقوى، لياقة أفضل، ورحلة مستمرة نحو أهدافك.',
      hero_image: '/images/hero.svg',
      about_title: 'عن OXYGEN GYM',
      about_text: 'نادي أوكسجين جيم هو صرح رياضي متكامل في طرابلس بطريق عين زارة. تم تجهيز النادي بأحدث المعدات الرياضية وأقوى التجهيزات العالمية لضمان تجربة تدريب احترافية وممتعة تناسب جميع المستويات، تحت إشراف نخبة من المدربين المعتمدين.',
      stat_equipment: '120+',
      stat_area: '1500م²',
      stat_programs: '15+',
      stat_coaches: '10+',
      show_stats: '1',
      subscription_notice: 'الاشتراك يتم حضوريًا داخل Oxygen Gym. لا يوجد دفع أو اشتراك إلكتروني عبر الموقع.'
    };

    for (const [k, v] of Object.entries(defaultSettings)) {
      db.run("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)", [k, v]);
    }

    // Seed Categories
    const eqCats = ['الصدر', 'الظهر', 'الأكتاف', 'الأرجل', 'الذراعين', 'الكارديو', 'الأوزان الحرة', 'المقاومة', 'التدريب الوظيفي'];
    eqCats.forEach((cat, idx) => {
      db.run("INSERT INTO equipment_categories (name, slug, order_index) VALUES (?, ?, ?)", [cat, `cat-${idx + 1}`, idx]);
    });

    const trnCats = ['فنون قتالية', 'كارديو ولياقة', 'قوة وبناء أجسام', 'تدريب وظيفي'];
    trnCats.forEach((cat, idx) => {
      db.run("INSERT INTO training_categories (name, slug, order_index) VALUES (?, ?, ?)", [cat, `trn-cat-${idx + 1}`, idx]);
    });

    const newsCats = ['أخبار الجيم', 'فعاليات', 'بطولات', 'إعلانات', 'عروض', 'نصائح رياضية'];
    newsCats.forEach((cat, idx) => {
      db.run("INSERT INTO news_categories (name, slug, order_index) VALUES (?, ?, ?)", [cat, `news-cat-${idx + 1}`, idx]);
    });

    const prodCats = ['مكملات غذائية', 'بروتين وكرياتين', 'ملابس رياضية', 'إكسسوارات'];
    prodCats.forEach((cat, idx) => {
      db.run("INSERT INTO product_categories (name, slug, order_index) VALUES (?, ?, ?)", [cat, `prod-cat-${idx + 1}`, idx]);
    });

    // Seed Initial Seed Equipment
    db.run(`
      INSERT INTO equipment (name, slug, image_url, description, category_name, manufacturer, model, target_muscles, usage_level, instructions, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'قفص تمارين القوة والأثقال الحرة (Power Rack)',
      'power-rack-pro',
      '/images/equipment.svg',
      'قفص تدريب احترافي متين للأوزان الثقيلة ومجهز بقضبان حماية متقدمة ومثبتات سكوات وديدلفت.',
      'الأوزان الحرة',
      'Hammer Strength',
      'HD Elite Power Rack',
      'كامل عضلات الجسم، الأرجل، الصدر، الظهر',
      'متقدم / محترف',
      'اضبط ارتفاع دعامات الأمان قبل البدء، تأكد من إحكام تثبيت الأوزان بالأطواق.',
      1, 1, 1
    ]);

    db.run(`
      INSERT INTO equipment (name, slug, image_url, description, category_name, manufacturer, model, target_muscles, usage_level, instructions, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'جهاز ضغط الصدر العريض المائل (Incline Chest Press)',
      'incline-chest-press',
      '/images/equipment.svg',
      'جهاز معزول لتدريب الجزء العلوي من عضلات الصدر مع حركة بيوميكانيكية دقيقة تحافظ على سلامة المفاصل.',
      'الصدر',
      'Life Fitness',
      'Signature Series',
      'الصدر العلوي، الترايسبس، الأكتاف الأمامية',
      'جميع المستويات',
      'اضبط المقعد بحيث يكون المقبض بمحاذاة منتصف الصدر العلوي. ادفع للأمام مع الزفير.',
      1, 1, 2
    ]);

    // Seed Initial Training
    db.run(`
      INSERT INTO training (name, slug, description, category_name, difficulty, image_url, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'الملاكمة الاحترافية (Boxing)',
      'boxing',
      'تدريبات ملاكمة شاملة تركز على اللياقة القلبية، خفة الحركة، الدقة، وردود الفعل السريعة بحلبة مجهزة وحقائب احترافية.',
      'فنون قتالية',
      'متوسط / متقدم',
      '/images/training.svg',
      1, 1
    ]);

    db.run(`
      INSERT INTO training (name, slug, description, category_name, difficulty, image_url, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'الكيك بوكسينج (Kickboxing)',
      'kickboxing',
      'برنامج عالي الشدة يجمع بين تقنيات اللكم والركل لزيادة التحمل البدني وحرق الدهون والدفاع عن النفس.',
      'فنون قتالية',
      'جميع المستويات',
      '/images/training.svg',
      1, 2
    ]);

    // Seed Memberships (Strictly informational - NO online checkout!)
    db.run(`
      INSERT INTO memberships (name, slug, price, currency, duration, features_json, description, is_featured, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'الباقة الشهرية الأساسية (BASIC)',
      'monthly-basic',
      150,
      'د.ل',
      'شهر واحد',
      JSON.stringify([
        'دخول كامل لصالة الحديد والأجهزة الحرة',
        'استخدام منطقة الكارديو المتطورة',
        'خزانة أمان خاصة خلال وقت التمرين',
        'مرافق الاستحمام وغرف تبديل الملابس',
        'تقييم لياقة بدنية أولي مجاني'
      ]),
      'الباقة المثالية للرياضيين والملتزمين بتمارين اللياقة وبناء الأجسام على مدار الشهر.',
      0, 1, 1
    ]);

    db.run(`
      INSERT INTO memberships (name, slug, price, currency, duration, features_json, description, is_featured, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'الباقة البلاتينية الشاملة (PREMIUM 3-MONTHS)',
      'premium-3-months',
      400,
      'د.ل',
      '3 أشهر',
      JSON.stringify([
        'دخول غير محدود لجميع مناطق الجيم',
        'حضور حصص الفنون القتالية والكيك بوكسينج',
        'خزانة مخصصة دائمة',
        'خطة تدريبية وتغذوية مخصصة كل شهر',
        'أولوية حجز حصص المدرب الخاص'
      ]),
      'باقة التميز للباحثين عن تحول حقيقي في القوة واللياقة مع متابعة مستمرة.',
      1, 1, 2
    ]);

    db.run(`
      INSERT INTO memberships (name, slug, price, currency, duration, features_json, description, is_featured, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'التدريب الخاص (PERSONAL TRAINING)',
      'personal-training',
      350,
      'د.ل',
      '12 جلسة خاصة',
      JSON.stringify([
        'تدريب فردي 1-on-1 مع مدرب محترف معتمد',
        'تصميم جدول تدريبي خاص بأهدافك الدقيقة',
        'متابعة القياسات ونسبة الدهون أسبوعياً',
        'إشراف كامل على الأداء التكتيكي والسلامة'
      ]),
      'جلسات فردية مركزة مع مدربك الخاص لتحقيق أقصى استفادة وسرعة في النتائج.',
      0, 1, 3
    ]);

    // Seed Facilities
    db.run(`
      INSERT INTO facilities (name, slug, image_url, description, category, display_order, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'غرف تبديل الملابس والخزائن الذكية',
      'lockers-and-changing-rooms',
      '/images/facilities.svg',
      'مساحات فسيحة ونظيفة مجهزة بخزائن آمنة ومرافق شخصية تحافظ على خصوصيتك وراحتك طوال فترة التدريب.',
      'مرافق الراحة',
      1, 1
    ]);

    db.run(`
      INSERT INTO facilities (name, slug, image_url, description, category, display_order, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'حمامات الشاور المجهزة',
      'showers-and-washrooms',
      '/images/facilities.svg',
      'أقسام استحمام فندقية بالماء الساخن ومستلزمات نظافة دورية على مدار ساعات العمل.',
      'النظافة والاستجمام',
      2, 1
    ]);

    // Seed News
    db.run(`
      INSERT INTO news (title, slug, cover_image, content, category_name, author, is_published, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'افتتاح صالة الفنون القتالية وحلبة الملاكمة الجديدة في أوكسجين جيم',
      'new-boxing-ring-launch',
      '/images/training.svg',
      'يسر إدارة أوكسجين جيم الإعلان عن جاهزية قسم الفنون القتالية المتكامل بحلبة ملاكمة بمواصفات أولمبية وحقائب تدريب متنوعة لخدمة أبطالنا ومحبي الرياضة القتالية.',
      'أخبار الجيم',
      'إدارة الجيم',
      1, 1
    ]);

    // Seed Products (strictly catalog)
    db.run(`
      INSERT INTO products (name, slug, image_url, description, price, currency, category_name, availability_status, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'واي بروتين معزول عالي الجودة (Whey Isolate)',
      'gold-standard-whey-isolate',
      '/images/products.svg',
      'مكمل بروتين نقي سريع الامتصاص لدعم الاستشفاء العضلي وبناء الكتلة العضلية الصافية، خالي من السكر المضاف.',
      280,
      'د.ل',
      'مكملات غذائية',
      'متوفر بالصالة',
      1, 1, 1
    ]);

    db.run(`
      INSERT INTO products (name, slug, image_url, description, price, currency, category_name, availability_status, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'كرياتين مونوهيدرات ميكرونايزد (Creatine Monohydrate)',
      'creatine-monohydrate-pure',
      '/images/products.svg',
      'كرياتين نقي 100% لزيادة القوة الانفجارية والقدرة على رفع الأوزان الثقيلة وزيادة حجم الخلايا العضلية.',
      140,
      'د.ل',
      'بروتين وكرياتين',
      'متوفر بالصالة',
      1, 1, 2
    ]);

    // Seed Social Links
    db.run("INSERT INTO social_links (platform, url, is_active, order_index) VALUES (?, ?, ?, ?)", ['Instagram', 'https://instagram.com/oxygengym_ly', 1, 1]);
    db.run("INSERT INTO social_links (platform, url, is_active, order_index) VALUES (?, ?, ?, ?)", ['Facebook', 'https://facebook.com/oxygengym.ly', 1, 2]);
    db.run("INSERT INTO social_links (platform, url, is_active, order_index) VALUES (?, ?, ?, ?)", ['WhatsApp', 'https://wa.me/218911234567', 1, 3]);
  }
}

// Helpers for executing SQL commands cleanly
export function executeQuery<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error("Database not initialized");
  const cleaned = cleanSqlParams(params);
  const stmt = dbInstance.prepare(sql);
  stmt.bind(cleaned);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function executeGet<T = any>(sql: string, params: any[] = []): T | null {
  const rows = executeQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function executeRun(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  if (!dbInstance) throw new Error("Database not initialized");
  const cleaned = cleanSqlParams(params);
  dbInstance.run(sql, cleaned);
  let rowid = 0;
  try {
    const res = dbInstance.exec("SELECT last_insert_rowid() as id");
    if (res && res.length && res[0].values && res[0].values[0]) {
      rowid = Number(res[0].values[0][0]) || 0;
    }
  } catch (e) {
    rowid = 0;
  }

  let changes = 0;
  try {
    const res = dbInstance.exec("SELECT changes() as cnt");
    if (res && res.length && res[0].values && res[0].values[0]) {
      changes = Number(res[0].values[0][0]) || 0;
    }
  } catch (e) {
    changes = 0;
  }

  saveDb();
  return { lastInsertRowid: rowid, changes };
}
