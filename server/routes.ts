import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { executeQuery, executeGet, executeRun, normalizePhone, cleanInvisibleChars, convertArabicIndicToWestern } from './db.js';
import { JWT_SECRET, STAFF_ROLES } from './auth-config.js';

const router = Router();
const MIN_MEMBER_PASSWORD_LENGTH = 6;

// Multer storage for media uploads
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'oxygen-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Slugify helper
function slugify(text: string): string {
  const base = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  return base || 'item-' + Date.now();
}

// Authentication Middleware
export interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string; role: string };
}

export interface MemberAuthRequest extends Request {
  member?: { id: number; phone: string; full_name: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح به. يرجى تسجيل الدخول' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; email: string; role: string };
    if (!decoded.role || !STAFF_ROLES.has(decoded.role)) {
      return res.status(403).json({ error: 'صلاحيات غير كافية للوصول إلى لوحة الإدارة' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة الدخول منتهية الصلاحية أو غير صالحة' });
  }
}

export function requireMemberAuth(req: MemberAuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'يرجى تسجيل الدخول للمتابعة' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; phone: string; full_name: string; role: string };
    if (decoded.role !== 'member') {
      return res.status(403).json({ error: 'يجب تسجيل الدخول بحساب مشترك' });
    }
    req.member = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة الحساب منتهية الصلاحية' });
  }
}

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts[ip];
  if (!entry) return true;
  if (now - entry.lastTime >= 60000) {
    delete loginAttempts[ip];
    return true;
  }
  return entry.count < 6;
}

function recordLoginFailure(ip: string) {
  const now = Date.now();
  loginAttempts[ip] = {
    count: (loginAttempts[ip]?.count || 0) + 1,
    lastTime: now,
  };
}

// Rate limiting basic memory store for login attempts
const loginAttempts: Record<string, { count: number; lastTime: number }> = {};

// Helper: Calculate member subscription status and days remaining
export function computeMemberStatus(m: any) {
  if (!m.is_subscribed || !m.end_date) {
    return { status: 'inactive' as const, days_left: 0 };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(m.end_date);
  end.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { status: 'expired' as const, days_left: diffDays };
  }
  if (diffDays <= 7) {
    return { status: 'expiring' as const, days_left: diffDays };
  }
  return { status: 'active' as const, days_left: diffDays };
}

// Helper: Generate member alert notifications
export function getMemberNotifications(member: any, daysLeft: number, status: string) {
  const notifications = [];

  if (status === 'expiring') {
    notifications.push({
      id: `expiring-${member.id}`,
      type: 'expiring_soon' as const,
      title: 'تنبيه: اقتراب انتهاء الاشتراك',
      message: `مرحباً ${member.full_name}، باقي على انتهاء اشتراكك ${daysLeft} أيام فقط (تاريخ الانتهاء ${member.end_date}). يرجى زيارة مكتب الاستقبال في أوكسجين جيم لتجديد الاشتراك ومواصلة تدريبك دون توقف!`,
      date: new Date().toISOString(),
      urgent: true,
    });
  } else if (status === 'expired') {
    notifications.push({
      id: `expired-${member.id}`,
      type: 'expired' as const,
      title: 'تنبيه: اشتراكك الرياضي منتهي',
      message: `مرحباً ${member.full_name}، لقد انتهى اشتراكك بتاريخ (${member.end_date}). نرحب بك في الجيم في أي وقت لتجديد الاشتراك والعودة للتمرين.`,
      date: new Date().toISOString(),
      urgent: true,
    });
  } else if (status === 'active') {
    notifications.push({
      id: `active-${member.id}`,
      type: 'welcome' as const,
      title: 'اشتراكك نشط في أوكسجين جيم',
      message: `باقة (${member.plan_name || 'الأساسية'}) نشطة ومحدثة. باقي على اشتراكك ${daysLeft} يوماً. تدريباً موفقاً بطل أوكسجين!`,
      date: new Date().toISOString(),
      urgent: false,
    });
  } else {
    notifications.push({
      id: `inactive-${member.id}`,
      type: 'inactive' as const,
      title: 'حساب مسجل — لم تشترك بعد',
      message: `أهلاً بك ${member.full_name} في أوكسجين جيم. لم تسجل اشتراكك بعد، تفضل بزيارة صالتنا بطريق عين زارة لاختيار باقتك واستلام بطاقتك الرياضية.`,
      date: new Date().toISOString(),
      urgent: false,
    });
  }

  if (member.last_renewed_at) {
    notifications.push({
      id: `renewed-${member.id}`,
      type: 'renewed' as const,
      title: 'تم تجديد الاشتراك بنجاح',
      message: `تم اعتماد وتجديد اشتراكك بنجاح. شكراً لثقتك المستمرة في أوكسجين جيم!`,
      date: member.last_renewed_at,
      urgent: false,
    });
  }

  return notifications;
}

// ==========================================
// AUTH ROUTES (ADMIN & DASHBOARD)
// ==========================================

router.post('/auth/login', (req, res) => {
  const { username, password, account_type } = req.body;
  const ip = req.ip || 'ip';

  // Map username aliases to system usernames: manager, waleed, ali
  let rawTarget = cleanInvisibleChars((username || account_type || 'manager').toString());
  let targetUsername = 'manager';
  
  if (
    rawTarget === 'manager' ||
    rawTarget === 'مدير الجم' ||
    rawTarget === 'مدير الجيم' ||
    rawTarget === 'مدير' ||
    rawTarget === 'admin'
  ) {
    targetUsername = 'manager';
  } else if (
    rawTarget === 'waleed' ||
    rawTarget === 'مدرب وليد' ||
    rawTarget === 'كابتن وليد' ||
    rawTarget === 'وليد'
  ) {
    targetUsername = 'waleed';
  } else if (
    rawTarget === 'ali' ||
    rawTarget === 'مدرب علي' ||
    rawTarget === 'كابتن علي' ||
    rawTarget === 'علي'
  ) {
    targetUsername = 'ali';
  } else {
    targetUsername = rawTarget;
  }

  const passStr = cleanInvisibleChars((password || '').toString());

  if (!checkLoginRateLimit(ip)) {
    return res.status(429).json({ error: 'تم تجاوز عدد محاولات الدخول. يرجى الانتظار دقيقة' });
  }

  if (!passStr) {
    return res.status(400).json({ error: 'يرجى إدخال كلمة المرور' });
  }

  const user = executeGet(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [targetUsername, targetUsername]
  );

  if (!user) {
    recordLoginFailure(ip);
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const isMatch = bcrypt.compareSync(passStr, user.password_hash) ||
    bcrypt.compareSync(convertArabicIndicToWestern(passStr), user.password_hash);

  if (!isMatch) {
    recordLoginFailure(ip);
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  delete loginAttempts[ip];

  const trainerTitle =
    user.username === 'waleed'
      ? 'كابتن وليد (مدير الجيم والمدرب العام)'
      : user.username === 'ali'
      ? 'كابتن علي (مدرب اللياقة وبناء الأجسام)'
      : 'مدير صالة أوكسجين جيم (كابتن وليد)';

  const trainerId = user.username === 'ali' ? 2 : 1;

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    trainer_name: trainerTitle,
    trainer_id: trainerId,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    user: payload,
    message: `تم تسجيل الدخول بنجاح بحساب (${trainerTitle})`
  });
});

// ==========================================
// MEMBER AUTHENTICATION & PORTAL ROUTES
// ==========================================

// Register new member with robust sanitation & persistence
router.post('/member/register', (req, res) => {
  const {
    full_name,
    phone,
    email,
    password,
    age,
    is_subscribed,
    plan_name,
    start_date,
    end_date,
    fitness_goal,
  } = req.body;

  if (!full_name || !phone || !password) {
    return res.status(400).json({ error: 'يرجى إدخال الاسم ورقم الهاتف وكلمة المرور' });
  }

  const cleanName = cleanInvisibleChars(full_name).trim();
  const rawPhone = cleanInvisibleChars(phone.toString()).trim();
  const cleanPhone = normalizePhone(rawPhone) || rawPhone;
  const cleanEmail = email ? cleanInvisibleChars(email).trim().toLowerCase() : null;
  const cleanPassword = cleanInvisibleChars(password.toString()).trim();

  if (cleanPassword.length < MIN_MEMBER_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `كلمة المرور يجب أن لا تقل عن ${MIN_MEMBER_PASSWORD_LENGTH} خانات` });
  }

  // Check if phone or cleanPhone already registered
  const existing = executeGet(
    'SELECT id, full_name, phone FROM members WHERE phone = ? OR phone = ?',
    [cleanPhone, rawPhone]
  );
  if (existing) {
    return res.status(400).json({
      error: `رقم الهاتف (${cleanPhone}) مسجل بالفعل باسم (${existing.full_name}). يمكنك تسجيل الدخول مباشرة!`,
      alreadyRegistered: true,
      registeredPhone: cleanPhone,
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(cleanPassword, salt);

  const isSub = (is_subscribed === true || is_subscribed === 1 || is_subscribed === '1') ? 1 : 0;
  const tempMember = {
    is_subscribed: isSub,
    end_date: isSub ? end_date : null,
  };
  const { status, days_left } = computeMemberStatus(tempMember);

  const result = executeRun(`
    INSERT INTO members (
      full_name, phone, email, password_hash, age, is_subscribed,
      plan_name, start_date, end_date, status, fitness_goal, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cleanName,
    cleanPhone,
    cleanEmail,
    password_hash,
    age ? Number(convertArabicIndicToWestern(age.toString())) : null,
    isSub,
    isSub ? (plan_name || 'الباقة الشهرية الأساسية (BASIC)') : null,
    isSub ? (start_date || new Date().toISOString().split('T')[0]) : null,
    isSub ? end_date : null,
    status,
    fitness_goal || null,
    'تسجيل عبر الموقع'
  ]);

  let newMember = executeGet('SELECT * FROM members WHERE id = ?', [result.lastInsertRowid]);
  if (!newMember) {
    newMember = executeGet('SELECT * FROM members WHERE phone = ?', [cleanPhone]);
  }

  if (!newMember) {
    return res.status(500).json({ error: 'تعذر استرجاع بيانات المشترك بعد الحفظ. يرجى المحاولة مرة أخرى' });
  }

  delete newMember.password_hash;
  newMember.days_left = days_left;

  const token = jwt.sign(
    { id: newMember.id, phone: newMember.phone, full_name: newMember.full_name, role: 'member' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const notifications = getMemberNotifications(newMember, days_left, status);

  return res.json({
    token,
    member: newMember,
    notifications,
    message: 'تم إنشاء حسابك في أوكسجين جيم وحفظ بياناتك بنجاح!',
  });
});

// Member Login with resilient matching and unicode cleaning
router.post('/member/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف أو البريد أو اسم المشترك وكلمة المرور' });
  }

  const raw = cleanInvisibleChars(identifier.toString()).trim();
  const cleanPhone = normalizePhone(raw);
  const pass = cleanInvisibleChars(password.toString()).trim();

  // 1. Direct match on phone, cleanPhone, email, or full_name
  let member = executeGet(
    `SELECT * FROM members WHERE 
      phone = ? OR phone = ? OR 
      email = ? OR LOWER(email) = LOWER(?) OR
      full_name = ? OR LOWER(full_name) = LOWER(?)`,
    [raw, cleanPhone, raw, raw, raw, raw]
  );

  // 2. If not found, try matching with leading 0 added or stripped
  if (!member) {
    const withZero = raw.startsWith('0') ? raw : '0' + raw;
    const withoutZero = raw.startsWith('0') ? raw.replace(/^0+/, '') : raw;
    member = executeGet(
      'SELECT * FROM members WHERE phone = ? OR phone = ?',
      [withZero, withoutZero]
    );
  }

  if (!member) {
    return res.status(401).json({
      error: 'بيانات الحساب غير موجودة، يرجى التأكد من رقم الهاتف أو البريد أو الاسم المسجل',
      notFound: true,
    });
  }

  // Compare passwords supporting Western & Arabic digits
  const isMatch = bcrypt.compareSync(pass, member.password_hash) ||
    bcrypt.compareSync(convertArabicIndicToWestern(pass), member.password_hash);

  if (!isMatch) {
    return res.status(401).json({
      error: 'كلمة المرور غير صحيحة',
    });
  }

  // Update dynamic status based on current date
  const { status, days_left } = computeMemberStatus(member);
  if (status !== member.status) {
    executeRun('UPDATE members SET status = ? WHERE id = ?', [status, member.id]);
    member.status = status;
  }

  delete member.password_hash;
  member.days_left = days_left;

  const token = jwt.sign(
    { id: member.id, phone: member.phone, full_name: member.full_name, role: 'member' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const notifications = getMemberNotifications(member, days_left, status);

  return res.json({
    token,
    member,
    notifications,
    message: `مرحباً بك مجدداً، ${member.full_name}`,
  });
});

// Member profile & alerts
router.get('/member/me', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const member = executeGet('SELECT * FROM members WHERE id = ?', [req.member!.id]);
  if (!member) {
    return res.status(404).json({ error: 'المشترك غير موجود' });
  }

  const { status, days_left } = computeMemberStatus(member);
  if (status !== member.status) {
    executeRun('UPDATE members SET status = ? WHERE id = ?', [status, member.id]);
    member.status = status;
  }

  delete member.password_hash;
  member.days_left = days_left;
  const notifications = getMemberNotifications(member, days_left, status);

  return res.json({ member, notifications });
});

// Member update profile
router.put('/member/profile', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const { full_name, email, age, fitness_goal } = req.body;
  if (!full_name) {
    return res.status(400).json({ error: 'الاسم مطلوب' });
  }

  executeRun(`
    UPDATE members SET
      full_name = ?, email = ?, age = ?, fitness_goal = ?
    WHERE id = ?
  `, [full_name.trim(), email ? email.trim() : null, age ? Number(age) : null, fitness_goal || null, req.member!.id]);

  const updated = executeGet('SELECT * FROM members WHERE id = ?', [req.member!.id]);
  delete updated.password_hash;
  const { status, days_left } = computeMemberStatus(updated);
  updated.days_left = days_left;

  return res.json({
    success: true,
    member: updated,
    message: 'تم تحديث بيانات ملفك بنجاح',
  });
});

// ==========================================
// MEMBER & TRAINER MESSAGES & WORKOUT PLANS
// ==========================================

// Get messages for logged in member
router.get('/member/messages', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const memberId = req.member!.id;
  const messages = executeQuery(
    'SELECT * FROM trainer_messages WHERE member_id = ? ORDER BY id ASC',
    [memberId]
  );

  const parsed = messages.map((m: any) => {
    let plan = null;
    if (m.plan_details_json && m.plan_details_json !== '{}') {
      try {
        plan = JSON.parse(m.plan_details_json);
      } catch (e) {
        plan = null;
      }
    }
    return {
      ...m,
      plan_details: plan,
    };
  });

  const unreadCount = parsed.filter(m => m.sender_type === 'trainer' && !m.is_read).length;
  const canChat = parsed.some(m => m.sender_type === 'trainer');
  const hasPendingRequest = !canChat && parsed.some(m => m.message_type === 'chat_request');

  return res.json({
    messages: parsed,
    unreadCount,
    can_chat: canChat,
    has_pending_request: hasPendingRequest,
    official_trainers: [
      { id: 1, name: 'كابتن وليد (مدير الجيم والمدرب العام)', role: 'مدير الصالة وكبير المدربين' },
      { id: 2, name: 'كابتن علي (مدرب اللياقة وبناء الأجسام)', role: 'مدرب بناء الأجسام واللياقة البدنية' },
    ],
  });
});

// Member sends a message to the trainer
router.post('/member/messages', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const memberId = req.member!.id;
  const { content, trainer_name, message_type = 'chat', title, plan_details } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'محتوى الرسالة مطلوب' });
  }

  // Check if trainer has messaged member first, or if this is a chat request
  const trainerCountRes = executeGet(
    "SELECT count(*) as cnt FROM trainer_messages WHERE member_id = ? AND sender_type = 'trainer'",
    [memberId]
  );
  const hasTrainerInitiated = (trainerCountRes?.cnt || 0) > 0;

  if (!hasTrainerInitiated && message_type !== 'chat_request') {
    return res.status(403).json({
      error: 'المدرب فقط يتواصل أولاً مع المشترك، أو يمكنك إرسال طلب محادثة واستشارة تدريبية أولاً، وبمجرد رد المدرب يمكنك المحادثة وإرسال الخطط في أي وقت.',
      requires_chat_request: true,
    });
  }

  const defaultTitle = message_type === 'chat_request'
    ? `طلب محادثة واستشارة تدريبية مع ${trainer_name || 'المدرب'}`
    : message_type === 'plan_request' 
    ? 'طلب خطة تدريبية جديدة' 
    : message_type === 'workout_plan'
    ? (title || 'خطة تدريبية مرفقة من المشترك')
    : (title || 'رسالة من المشترك');

  let planDetailsJson: string | null = null;
  if (plan_details) {
    planDetailsJson = typeof plan_details === 'string' ? plan_details : JSON.stringify(plan_details);
  }

  const result = executeRun(`
    INSERT INTO trainer_messages (member_id, trainer_name, sender_type, message_type, title, content, plan_details_json, is_read)
    VALUES (?, ?, 'member', ?, ?, ?, ?, 0)
  `, [
    memberId,
    trainer_name || 'كابتن وليد (مدير الجيم والمدرب العام)',
    message_type,
    defaultTitle,
    content.trim(),
    planDetailsJson
  ]);

  const newMsg = executeGet('SELECT * FROM trainer_messages WHERE id = ?', [result.lastInsertRowid]);
  if (newMsg && newMsg.plan_details_json) {
    try {
      newMsg.plan_details = JSON.parse(newMsg.plan_details_json);
    } catch (e) {
      newMsg.plan_details = null;
    }
  }

  return res.json({
    success: true,
    message: newMsg,
    can_chat: hasTrainerInitiated || false,
  });
});

// Member sends a direct chat request to a trainer
router.post('/member/chat-request', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const memberId = req.member!.id;
  const { trainer_name, content, fitness_goal } = req.body;

  const coachName = trainer_name || 'كابتن وليد (مدير الجيم والمدرب العام)';
  const requestContent = content?.trim() || `أرغب في بدء متابعة تدريبية معك يا كابتن واستلام خطة التمارين المناسبة لهدفي الرياضي (${fitness_goal || 'اللياقة والقوة'}).`;

  const result = executeRun(`
    INSERT INTO trainer_messages (member_id, trainer_name, sender_type, message_type, title, content, plan_details_json, is_read)
    VALUES (?, ?, 'member', 'chat_request', ?, ?, '{}', 0)
  `, [
    memberId,
    coachName,
    `طلب محادثة واستشارة تدريبية مع ${coachName}`,
    requestContent,
  ]);

  const newMsg = executeGet('SELECT * FROM trainer_messages WHERE id = ?', [result.lastInsertRowid]);

  return res.json({
    success: true,
    message: newMsg,
    info: 'تم إرسال طلب المحادثة بنجاح إلى المدرب، وبمجرد رده ستفتح المحادثة المباشرة الكاملة.',
  });
});

// Mark message as read by member
router.post('/member/messages/:id/read', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const memberId = req.member!.id;
  const { id } = req.params;

  executeRun('UPDATE trainer_messages SET is_read = 1 WHERE id = ? AND member_id = ?', [id, memberId]);

  return res.json({ success: true });
});

// Member confirms/acknowledges receipt of a workout plan
router.post('/member/messages/:id/confirm-plan', requireMemberAuth, (req: MemberAuthRequest, res) => {
  const memberId = req.member!.id;
  const { id } = req.params;

  const planMsg = executeGet('SELECT * FROM trainer_messages WHERE id = ? AND member_id = ?', [id, memberId]);
  if (!planMsg) {
    return res.status(404).json({ error: 'الخطة التدريبية غير موجودة' });
  }

  // Mark plan as read
  executeRun('UPDATE trainer_messages SET is_read = 1 WHERE id = ?', [id]);

  // Insert automatic confirmation message in the chat
  const confirmResult = executeRun(`
    INSERT INTO trainer_messages (member_id, trainer_name, sender_type, message_type, title, content, is_read)
    VALUES (?, ?, 'member', 'chat', 'تأكيد استلام الخطة', ?, 1)
  `, [
    memberId,
    planMsg.trainer_name || 'كابتن وليد (مدير الجيم والمدرب العام)',
    `تم استلام الخطة التدريبية (${planMsg.title || 'الخطة التدريبية'}) بنجاح! سأبدأ في تنفيذ التمارين والالتزام بالجدول يا كابتن.`
  ]);

  const newMsg = executeGet('SELECT * FROM trainer_messages WHERE id = ?', [confirmResult.lastInsertRowid]);

  return res.json({
    success: true,
    confirmationMessage: newMsg,
  });
});

// Admin/Trainer routes for messaging members
router.get('/admin/members/:id/messages', requireAuth, (req, res) => {
  const { id } = req.params;
  const member = executeGet('SELECT id, full_name, phone, plan_name, fitness_goal FROM members WHERE id = ?', [id]);
  if (!member) {
    return res.status(404).json({ error: 'المشترك غير موجود' });
  }

  const messages = executeQuery(
    'SELECT * FROM trainer_messages WHERE member_id = ? ORDER BY id ASC',
    [id]
  );

  const parsed = messages.map((m: any) => {
    let plan = null;
    if (m.plan_details_json && m.plan_details_json !== '{}') {
      try {
        plan = JSON.parse(m.plan_details_json);
      } catch (e) {
        plan = null;
      }
    }
    return {
      ...m,
      plan_details: plan,
    };
  });

  return res.json({
    member,
    messages: parsed,
  });
});

router.post('/admin/members/:id/messages', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    trainer_id,
    trainer_name,
    message_type = 'chat',
    title,
    content,
    plan_details
  } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'محتوى الرسالة أو الخطة التدريبية مطلوب' });
  }

  const member = executeGet('SELECT id, full_name FROM members WHERE id = ?', [id]);
  if (!member) {
    return res.status(404).json({ error: 'المشترك غير موجود' });
  }

  const planJson = plan_details ? JSON.stringify(plan_details) : '{}';
  const defaultTitle = message_type === 'workout_plan'
    ? (title || 'خطة تدريبية مخصصة جديدة')
    : message_type === 'nutrition_plan'
    ? (title || 'خطة غذائية ونصائح تغذية')
    : (title || 'رسالة من المدرب');

  const result = executeRun(`
    INSERT INTO trainer_messages (
      member_id, trainer_id, trainer_name, sender_type, message_type, title, content, plan_details_json, is_read
    ) VALUES (?, ?, ?, 'trainer', ?, ?, ?, ?, 0)
  `, [
    id,
    trainer_id ? Number(trainer_id) : null,
    trainer_name || 'كابتن وليد (مدير الجيم والمدرب العام)',
    message_type,
    defaultTitle,
    content.trim(),
    planJson
  ]);

  const newMsg = executeGet('SELECT * FROM trainer_messages WHERE id = ?', [result.lastInsertRowid]);
  let parsedPlan = null;
  if (newMsg?.plan_details_json && newMsg.plan_details_json !== '{}') {
    try {
      parsedPlan = JSON.parse(newMsg.plan_details_json);
    } catch (e) {}
  }

  return res.json({
    success: true,
    message: {
      ...newMsg,
      plan_details: parsedPlan,
    }
  });
});

router.delete('/admin/members/messages/:msgId', requireAuth, (req, res) => {
  const { msgId } = req.params;
  executeRun('DELETE FROM trainer_messages WHERE id = ?', [msgId]);
  return res.json({ success: true, message: 'تم حذف الرسالة بنجاح' });
});

router.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = executeGet(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [req.user!.id]
  );
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  return res.json({ user });
});

router.post('/auth/change-password', requireAuth, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' });
  }

  const user = executeGet('SELECT * FROM users WHERE id = ?', [req.user!.id]);
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  executeRun('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user!.id]);

  return res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Site Settings
router.get('/site-settings', (_req, res) => {
  const rows = executeQuery<{ key: string; value: string }>('SELECT key, value FROM site_settings');
  const settings: Record<string, string> = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  return res.json(settings);
});

// Equipment
router.get('/equipment', (req, res) => {
  const { category, search, featured } = req.query;
  let sql = 'SELECT * FROM equipment WHERE is_published = 1';
  const params: any[] = [];

  if (category) {
    sql += ' AND category_name = ?';
    params.push(category);
  }
  if (featured === '1') {
    sql += ' AND is_featured = 1';
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR target_muscles LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY display_order ASC, id DESC';
  const items = executeQuery(sql, params);
  return res.json(items);
});

router.get('/equipment/:slug', (req, res) => {
  const item = executeGet('SELECT * FROM equipment WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!item) return res.status(404).json({ error: 'المعدة غير موجودة' });
  return res.json(item);
});

router.get('/equipment-categories', (_req, res) => {
  const categories = executeQuery('SELECT * FROM equipment_categories ORDER BY order_index ASC, id ASC');
  return res.json(categories);
});

// Training & Sports
router.get('/training', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM training WHERE is_published = 1';
  const params: any[] = [];
  if (category) {
    sql += ' AND category_name = ?';
    params.push(category);
  }
  sql += ' ORDER BY display_order ASC, id DESC';
  const items = executeQuery(sql, params);
  return res.json(items);
});

router.get('/training/:slug', (req, res) => {
  const item = executeGet('SELECT * FROM training WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!item) return res.status(404).json({ error: 'التمرين غير موجود' });
  return res.json(item);
});

router.get('/training-categories', (_req, res) => {
  const categories = executeQuery('SELECT * FROM training_categories ORDER BY order_index ASC, id ASC');
  return res.json(categories);
});

// Trainers
router.get('/trainers', (_req, res) => {
  const trainers = executeQuery('SELECT * FROM trainers WHERE is_published = 1 ORDER BY display_order ASC, id DESC');
  return res.json(trainers);
});

router.get('/trainers/:slug', (req, res) => {
  const trainer = executeGet('SELECT * FROM trainers WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!trainer) return res.status(404).json({ error: 'المدرب غير موجود' });
  return res.json(trainer);
});

// Memberships (Information Only)
router.get('/memberships', (_req, res) => {
  const plans = executeQuery('SELECT * FROM memberships WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
  return res.json(plans);
});

// Facilities
router.get('/facilities', (_req, res) => {
  const facilities = executeQuery('SELECT * FROM facilities WHERE is_published = 1 ORDER BY display_order ASC, id ASC');
  return res.json(facilities);
});

router.get('/facilities/:slug', (req, res) => {
  const item = executeGet('SELECT * FROM facilities WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!item) return res.status(404).json({ error: 'المرفق غير موجود' });
  return res.json(item);
});

// News
router.get('/news', (req, res) => {
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM news WHERE is_published = 1';
  const params: any[] = [];
  if (category) {
    sql += ' AND category_name = ?';
    params.push(category);
  }
  if (featured === '1') {
    sql += ' AND is_featured = 1';
  }
  sql += ' ORDER BY published_at DESC, id DESC';
  const news = executeQuery(sql, params);
  return res.json(news);
});

router.get('/news/:slug', (req, res) => {
  const item = executeGet('SELECT * FROM news WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!item) return res.status(404).json({ error: 'الخبر غير موجود' });
  return res.json(item);
});

router.get('/news-categories', (_req, res) => {
  const categories = executeQuery('SELECT * FROM news_categories ORDER BY order_index ASC, id ASC');
  return res.json(categories);
});

// Products (Catalog Only)
router.get('/products', (req, res) => {
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM products WHERE is_published = 1';
  const params: any[] = [];
  if (category) {
    sql += ' AND category_name = ?';
    params.push(category);
  }
  if (featured === '1') {
    sql += ' AND is_featured = 1';
  }
  sql += ' ORDER BY display_order ASC, id DESC';
  const products = executeQuery(sql, params);
  return res.json(products);
});

router.get('/products/:slug', (req, res) => {
  const item = executeGet('SELECT * FROM products WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
  if (!item) return res.status(404).json({ error: 'المنتج غير موجود' });
  return res.json(item);
});

router.get('/product-categories', (_req, res) => {
  const categories = executeQuery('SELECT * FROM product_categories ORDER BY order_index ASC, id ASC');
  return res.json(categories);
});

// Social Links
router.get('/social-links', (_req, res) => {
  const links = executeQuery('SELECT * FROM social_links WHERE is_active = 1 ORDER BY order_index ASC, id ASC');
  return res.json(links);
});

router.get('/gallery', (_req, res) => {
  const media = executeQuery(
    'SELECT id, filename, original_name, url, mime_type, size, created_at FROM media ORDER BY id DESC'
  );
  return res.json(media);
});

// Global Search & Browse
router.get('/search', (req, res) => {
  const q = ((req.query.q as string) || '').trim();
  const type = (req.query.type as string) || 'all';

  if (!q) {
    return res.json({
      equipment: [],
      training: [],
      trainers: [],
      memberships: [],
      facilities: [],
      news: [],
      products: []
    });
  }

  const term = `%${q}%`;
  const results: Record<string, any[]> = {};

  if (type === 'all' || type === 'equipment') {
    results.equipment = executeQuery(
      'SELECT id, name, slug, image_url, description, category_name FROM equipment WHERE is_published = 1 AND (name LIKE ? OR description LIKE ? OR target_muscles LIKE ?)',
      [term, term, term]
    );
  }
  if (type === 'all' || type === 'training') {
    results.training = executeQuery(
      'SELECT id, name, slug, image_url, description, category_name, difficulty FROM training WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?)',
      [term, term]
    );
  }
  if (type === 'all' || type === 'trainers') {
    results.trainers = executeQuery(
      'SELECT id, name, slug, photo_url, specialty, bio FROM trainers WHERE is_published = 1 AND (name LIKE ? OR specialty LIKE ? OR bio LIKE ?)',
      [term, term, term]
    );
  }
  if (type === 'all' || type === 'memberships') {
    results.memberships = executeQuery(
      'SELECT id, name, slug, price, currency, duration, description FROM memberships WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)',
      [term, term]
    );
  }
  if (type === 'all' || type === 'facilities') {
    results.facilities = executeQuery(
      'SELECT id, name, slug, image_url, description, category FROM facilities WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?)',
      [term, term]
    );
  }
  if (type === 'all' || type === 'news') {
    results.news = executeQuery(
      'SELECT id, title, slug, cover_image, content, category_name FROM news WHERE is_published = 1 AND (title LIKE ? OR content LIKE ?)',
      [term, term]
    );
  }
  if (type === 'all' || type === 'products') {
    results.products = executeQuery(
      'SELECT id, name, slug, image_url, description, price, currency, category_name FROM products WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?)',
      [term, term]
    );
  }

  return res.json(results);
});

// Contact Form Submission (Physical inquiry / questions)
router.post('/contact', (req, res) => {
  const { name, phone, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'يرجى تعبئة الاسم ورقم الهاتف ونص الرسالة' });
  }

  executeRun(
    'INSERT INTO contact_messages (name, phone, message) VALUES (?, ?, ?)',
    [name.trim(), phone.trim(), message.trim()]
  );

  return res.json({
    success: true,
    message: 'شكراً لتواصلك مع أوكسجين جيم. سيتم مراجعة استفسارك والتواصل معك.'
  });
});

// ==========================================
// ADMIN DASHBOARD & CRUD ROUTES
// ==========================================

// Admin Statistics & Recent Logs
router.get('/admin/stats', requireAuth, (_req, res) => {
  const eqCount = (executeGet('SELECT count(*) as count FROM equipment') as any)?.count || 0;
  const trnCount = (executeGet('SELECT count(*) as count FROM training') as any)?.count || 0;
  const trainerCount = (executeGet('SELECT count(*) as count FROM trainers') as any)?.count || 0;
  const memberCount = (executeGet('SELECT count(*) as count FROM memberships') as any)?.count || 0;
  const facilityCount = (executeGet('SELECT count(*) as count FROM facilities') as any)?.count || 0;
  const newsCount = (executeGet('SELECT count(*) as count FROM news') as any)?.count || 0;
  const prodCount = (executeGet('SELECT count(*) as count FROM products') as any)?.count || 0;
  const mediaCount = (executeGet('SELECT count(*) as count FROM media') as any)?.count || 0;
  const unreadMessages = (executeGet('SELECT count(*) as count FROM contact_messages WHERE is_read = 0') as any)?.count || 0;

  // Member statistics
  const allMembers = executeQuery('SELECT * FROM members');
  let activeMembers = 0;
  let expiringMembers = 0;
  let expiredMembers = 0;
  allMembers.forEach((m: any) => {
    const { status } = computeMemberStatus(m);
    if (status === 'active') activeMembers++;
    else if (status === 'expiring') expiringMembers++;
    else if (status === 'expired') expiredMembers++;
  });

  const recentEquipment = executeQuery('SELECT id, name, category_name, is_published, created_at FROM equipment ORDER BY id DESC LIMIT 5');
  const recentNews = executeQuery('SELECT id, title, category_name, is_published, published_at FROM news ORDER BY id DESC LIMIT 5');
  const recentMessages = executeQuery('SELECT id, name, phone, message, is_read, created_at FROM contact_messages ORDER BY id DESC LIMIT 5');
  const recentMembers = executeQuery('SELECT id, full_name, phone, plan_name, status, end_date, created_at FROM members ORDER BY id DESC LIMIT 5');

  return res.json({
    counts: {
      equipment: eqCount,
      training: trnCount,
      trainers: trainerCount,
      memberships: memberCount,
      facilities: facilityCount,
      news: newsCount,
      products: prodCount,
      media: mediaCount,
      unreadMessages,
      totalMembers: allMembers.length,
      activeMembers,
      expiringMembers,
      expiredMembers
    },
    recent: {
      equipment: recentEquipment,
      news: recentNews,
      messages: recentMessages,
      members: recentMembers
    }
  });
});

// ==========================================
// ADMIN MEMBERS MANAGEMENT
// ==========================================
router.get('/admin/members', requireAuth, (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM members WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR plan_name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY id DESC';
  const rawMembers = executeQuery(sql, params);

  // Compute dynamic status and days_left for all members
  const members = rawMembers.map((m: any) => {
    const { status: compStatus, days_left } = computeMemberStatus(m);
    if (m.status !== compStatus) {
      executeRun('UPDATE members SET status = ? WHERE id = ?', [compStatus, m.id]);
      m.status = compStatus;
    }
    delete m.password_hash;
    return {
      ...m,
      days_left,
    };
  });

  if (status && status !== 'all') {
    const filtered = members.filter((m: any) => m.status === status);
    return res.json(filtered);
  }

  return res.json(members);
});

router.get('/admin/members/:id', requireAuth, (req, res) => {
  const member = executeGet('SELECT * FROM members WHERE id = ?', [req.params.id]);
  if (!member) return res.status(404).json({ error: 'المشترك غير موجود' });

  const { status, days_left } = computeMemberStatus(member);
  if (member.status !== status) {
    executeRun('UPDATE members SET status = ? WHERE id = ?', [status, member.id]);
    member.status = status;
  }
  delete member.password_hash;
  member.days_left = days_left;

  return res.json(member);
});

router.post('/admin/members', requireAuth, (req, res) => {
  const {
    full_name, phone, email, password, age,
    is_subscribed, plan_name, start_date, end_date,
    fitness_goal, notes
  } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
  }

  const existing = executeGet('SELECT id FROM members WHERE phone = ?', [phone.trim()]);
  if (existing) {
    return res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل لمشترك آخر' });
  }

  const passRaw = password ? cleanInvisibleChars(password.toString()).trim() : '';
  if (passRaw.length < MIN_MEMBER_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `كلمة مرور المشترك مطلوبة (${MIN_MEMBER_PASSWORD_LENGTH} أحرف على الأقل)`,
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(passRaw, salt);

  const isSub = is_subscribed ? 1 : 0;
  const tempMember = {
    is_subscribed: isSub,
    end_date: isSub ? end_date : null,
  };
  const { status } = computeMemberStatus(tempMember);

  const result = executeRun(`
    INSERT INTO members (
      full_name, phone, email, password_hash, age, is_subscribed,
      plan_name, start_date, end_date, status, fitness_goal, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    full_name.trim(), phone.trim(), email ? email.trim() : null, password_hash,
    age ? Number(age) : null, isSub, isSub ? (plan_name || 'الباقة الشهرية') : null,
    isSub ? start_date : null, isSub ? end_date : null, status, fitness_goal || null, notes || null
  ]);

  return res.json({
    success: true,
    id: result.lastInsertRowid,
    message: 'تمت إضافة المشترك بنجاح'
  });
});

router.put('/admin/members/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    full_name, phone, email, password, age,
    is_subscribed, plan_name, start_date, end_date,
    fitness_goal, notes
  } = req.body;

  const member = executeGet('SELECT * FROM members WHERE id = ?', [id]);
  if (!member) return res.status(404).json({ error: 'المشترك غير موجود' });

  if (phone && phone.trim() !== member.phone) {
    const existing = executeGet('SELECT id FROM members WHERE phone = ? AND id != ?', [phone.trim(), id]);
    if (existing) {
      return res.status(400).json({ error: 'رقم الهاتف مسجل لمشترك آخر' });
    }
  }

  let password_hash = member.password_hash;
  if (password && password.trim()) {
    const salt = bcrypt.genSaltSync(10);
    password_hash = bcrypt.hashSync(password.trim(), salt);
  }

  const isSub = is_subscribed ? 1 : 0;
  const tempMember = {
    is_subscribed: isSub,
    end_date: isSub ? end_date : null,
  };
  const { status } = computeMemberStatus(tempMember);

  executeRun(`
    UPDATE members SET
      full_name = ?, phone = ?, email = ?, password_hash = ?, age = ?,
      is_subscribed = ?, plan_name = ?, start_date = ?, end_date = ?,
      status = ?, fitness_goal = ?, notes = ?
    WHERE id = ?
  `, [
    (full_name || member.full_name).trim(),
    (phone || member.phone).trim(),
    email ? email.trim() : null,
    password_hash,
    age ? Number(age) : null,
    isSub,
    isSub ? plan_name : null,
    isSub ? start_date : null,
    isSub ? end_date : null,
    status,
    fitness_goal || null,
    notes || null,
    id
  ]);

  return res.json({ success: true, message: 'تم تحديث بيانات المشترك بنجاح' });
});

router.post('/admin/members/:id/renew', requireAuth, (req, res) => {
  const { id } = req.params;
  const { plan_name, duration_months, custom_end_date } = req.body;

  const member = executeGet('SELECT * FROM members WHERE id = ?', [id]);
  if (!member) return res.status(404).json({ error: 'المشترك غير موجود' });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  let newEnd: Date;
  if (custom_end_date) {
    newEnd = new Date(custom_end_date);
  } else {
    // If current subscription is still active, extend from current end_date, otherwise from today
    let baseDate = new Date();
    if (member.end_date && new Date(member.end_date) > today) {
      baseDate = new Date(member.end_date);
    }
    const months = Number(duration_months) || 1;
    newEnd = new Date(baseDate);
    newEnd.setMonth(newEnd.getMonth() + months);
  }

  const newEndStr = newEnd.toISOString().split('T')[0];
  const newPlan = plan_name || member.plan_name || 'الباقة الشهرية المجددة';
  const nowTimestamp = new Date().toISOString();

  executeRun(`
    UPDATE members SET
      is_subscribed = 1,
      plan_name = ?,
      start_date = ?,
      end_date = ?,
      status = 'active',
      last_renewed_at = ?
    WHERE id = ?
  `, [newPlan, todayStr, newEndStr, nowTimestamp, id]);

  const updated = executeGet('SELECT * FROM members WHERE id = ?', [id]);
  delete updated.password_hash;
  const { days_left } = computeMemberStatus(updated);
  updated.days_left = days_left;

  return res.json({
    success: true,
    member: updated,
    message: `تم تجديد اشتراك المشترك بنجاح حتى تاريخ ${newEndStr}`
  });
});

router.delete('/admin/members/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM members WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف حساب المشترك بنجاح' });
});

// Admin Equipment
router.get('/admin/equipment', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM equipment ORDER BY display_order ASC, id DESC');
  return res.json(items);
});

router.post('/admin/equipment', requireAuth, (req, res) => {
  const {
    name, slug, image_url, description, category_name,
    manufacturer, model, target_muscles, usage_level,
    instructions, display_order, is_featured, is_published
  } = req.body;

  if (!name) return res.status(400).json({ error: 'اسم المعدة مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO equipment (
      name, slug, image_url, description, category_name,
      manufacturer, model, target_muscles, usage_level,
      instructions, display_order, is_featured, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, finalSlug, image_url || null, description || null, category_name || null,
    manufacturer || null, model || null, target_muscles || null, usage_level || null,
    instructions || null, Number(display_order) || 0, is_featured ? 1 : 0, is_published !== false ? 1 : 0
  ]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المعدة بنجاح' });
});

router.put('/admin/equipment/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    name, slug, image_url, description, category_name,
    manufacturer, model, target_muscles, usage_level,
    instructions, display_order, is_featured, is_published
  } = req.body;

  if (!name) return res.status(400).json({ error: 'اسم المعدة مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE equipment SET
      name = ?, slug = ?, image_url = ?, description = ?, category_name = ?,
      manufacturer = ?, model = ?, target_muscles = ?, usage_level = ?,
      instructions = ?, display_order = ?, is_featured = ?, is_published = ?
    WHERE id = ?
  `, [
    name, finalSlug, image_url || null, description || null, category_name || null,
    manufacturer || null, model || null, target_muscles || null, usage_level || null,
    instructions || null, Number(display_order) || 0, is_featured ? 1 : 0, is_published ? 1 : 0,
    id
  ]);

  return res.json({ success: true, message: 'تم تحديث بيانات المعدة بنجاح' });
});

router.delete('/admin/equipment/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM equipment WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف المعدة بنجاح' });
});

router.patch('/admin/equipment/:id/toggle-publish', requireAuth, (req, res) => {
  const item = executeGet('SELECT is_published FROM equipment WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'المعدة غير موجودة' });
  const newVal = item.is_published ? 0 : 1;
  executeRun('UPDATE equipment SET is_published = ? WHERE id = ?', [newVal, req.params.id]);
  return res.json({ success: true, is_published: newVal });
});

router.patch('/admin/equipment/:id/toggle-featured', requireAuth, (req, res) => {
  const item = executeGet('SELECT is_featured FROM equipment WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'المعدة غير موجودة' });
  const newVal = item.is_featured ? 0 : 1;
  executeRun('UPDATE equipment SET is_featured = ? WHERE id = ?', [newVal, req.params.id]);
  return res.json({ success: true, is_featured: newVal });
});

// Admin Training & Sports
router.get('/admin/training', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM training ORDER BY display_order ASC, id DESC');
  return res.json(items);
});

router.post('/admin/training', requireAuth, (req, res) => {
  const { name, slug, description, category_name, difficulty, image_url, gallery_json, is_published, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم التمرين مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO training (name, slug, description, category_name, difficulty, image_url, gallery_json, is_published, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, finalSlug, description || null, category_name || null, difficulty || null, image_url || null, gallery_json || '[]', is_published !== false ? 1 : 0, Number(display_order) || 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة التمرين بنجاح' });
});

router.put('/admin/training/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, description, category_name, difficulty, image_url, gallery_json, is_published, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم التمرين مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE training SET
      name = ?, slug = ?, description = ?, category_name = ?, difficulty = ?, image_url = ?, gallery_json = ?, is_published = ?, display_order = ?
    WHERE id = ?
  `, [name, finalSlug, description || null, category_name || null, difficulty || null, image_url || null, gallery_json || '[]', is_published ? 1 : 0, Number(display_order) || 0, id]);

  return res.json({ success: true, message: 'تم تحديث التمرين بنجاح' });
});

router.delete('/admin/training/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM training WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف التمرين بنجاح' });
});

// Admin Trainers
router.get('/admin/trainers', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM trainers ORDER BY display_order ASC, id DESC');
  return res.json(items);
});

router.post('/admin/trainers', requireAuth, (req, res) => {
  const { name, slug, photo_url, specialty, bio, experience, training_types_json, gallery_json, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المدرب مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO trainers (name, slug, photo_url, specialty, bio, experience, training_types_json, gallery_json, display_order, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, finalSlug, photo_url || null, specialty || null, bio || null, experience || null, training_types_json || '[]', gallery_json || '[]', Number(display_order) || 0, is_published !== false ? 1 : 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المدرب بنجاح' });
});

router.put('/admin/trainers/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, photo_url, specialty, bio, experience, training_types_json, gallery_json, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المدرب مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE trainers SET
      name = ?, slug = ?, photo_url = ?, specialty = ?, bio = ?, experience = ?, training_types_json = ?, gallery_json = ?, display_order = ?, is_published = ?
    WHERE id = ?
  `, [name, finalSlug, photo_url || null, specialty || null, bio || null, experience || null, training_types_json || '[]', gallery_json || '[]', Number(display_order) || 0, is_published ? 1 : 0, id]);

  return res.json({ success: true, message: 'تم تحديث بيانات المدرب بنجاح' });
});

router.delete('/admin/trainers/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM trainers WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف المدرب بنجاح' });
});

// Admin Memberships (No checkout / no online payment fields)
router.get('/admin/memberships', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM memberships ORDER BY display_order ASC, id ASC');
  return res.json(items);
});

router.post('/admin/memberships', requireAuth, (req, res) => {
  const { name, slug, price, currency, duration, features_json, description, trainer_id, image_url, is_featured, is_active, display_order } = req.body;
  if (!name || !duration) return res.status(400).json({ error: 'اسم الباقة والمدة مطلوبان' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO memberships (name, slug, price, currency, duration, features_json, description, trainer_id, image_url, is_featured, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, finalSlug, Number(price) || 0, currency || 'د.ل', duration, features_json || '[]', description || null, trainer_id || null, image_url || null, is_featured ? 1 : 0, is_active !== false ? 1 : 0, Number(display_order) || 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة باقة الاشتراك بنجاح' });
});

router.put('/admin/memberships/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, price, currency, duration, features_json, description, trainer_id, image_url, is_featured, is_active, display_order } = req.body;
  if (!name || !duration) return res.status(400).json({ error: 'اسم الباقة والمدة مطلوبان' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE memberships SET
      name = ?, slug = ?, price = ?, currency = ?, duration = ?, features_json = ?, description = ?, trainer_id = ?, image_url = ?, is_featured = ?, is_active = ?, display_order = ?
    WHERE id = ?
  `, [name, finalSlug, Number(price) || 0, currency || 'د.ل', duration, features_json || '[]', description || null, trainer_id || null, image_url || null, is_featured ? 1 : 0, is_active ? 1 : 0, Number(display_order) || 0, id]);

  return res.json({ success: true, message: 'تم تحديث باقة الاشتراك بنجاح' });
});

router.delete('/admin/memberships/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM memberships WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف باقة الاشتراك بنجاح' });
});

// Admin Facilities
router.get('/admin/facilities', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM facilities ORDER BY display_order ASC, id ASC');
  return res.json(items);
});

router.post('/admin/facilities', requireAuth, (req, res) => {
  const { name, slug, image_url, description, category, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المرفق مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO facilities (name, slug, image_url, description, category, display_order, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, finalSlug, image_url || null, description || null, category || null, Number(display_order) || 0, is_published !== false ? 1 : 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المرفق بنجاح' });
});

router.put('/admin/facilities/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, image_url, description, category, display_order, is_published } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المرفق مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE facilities SET
      name = ?, slug = ?, image_url = ?, description = ?, category = ?, display_order = ?, is_published = ?
    WHERE id = ?
  `, [name, finalSlug, image_url || null, description || null, category || null, Number(display_order) || 0, is_published ? 1 : 0, id]);

  return res.json({ success: true, message: 'تم تحديث المرفق بنجاح' });
});

router.delete('/admin/facilities/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM facilities WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف المرفق بنجاح' });
});

// Admin News
router.get('/admin/news', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM news ORDER BY published_at DESC, id DESC');
  return res.json(items);
});

router.post('/admin/news', requireAuth, (req, res) => {
  const { title, slug, cover_image, content, category_name, author, is_published, is_featured } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان الخبر مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(title);

  const result = executeRun(`
    INSERT INTO news (title, slug, cover_image, content, category_name, author, is_published, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, finalSlug, cover_image || null, content || null, category_name || null, author || 'إدارة الجيم', is_published !== false ? 1 : 0, is_featured ? 1 : 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تم نشر الخبر بنجاح' });
});

router.put('/admin/news/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, slug, cover_image, content, category_name, author, is_published, is_featured } = req.body;
  if (!title) return res.status(400).json({ error: 'عنوان الخبر مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(title);

  executeRun(`
    UPDATE news SET
      title = ?, slug = ?, cover_image = ?, content = ?, category_name = ?, author = ?, is_published = ?, is_featured = ?
    WHERE id = ?
  `, [title, finalSlug, cover_image || null, content || null, category_name || null, author || 'إدارة الجيم', is_published ? 1 : 0, is_featured ? 1 : 0, id]);

  return res.json({ success: true, message: 'تم تحديث الخبر بنجاح' });
});

router.delete('/admin/news/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM news WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف الخبر بنجاح' });
});

// Admin Products (Catalog only - No checkout/cart)
router.get('/admin/products', requireAuth, (_req, res) => {
  const items = executeQuery('SELECT * FROM products ORDER BY display_order ASC, id DESC');
  return res.json(items);
});

router.post('/admin/products', requireAuth, (req, res) => {
  const { name, slug, image_url, description, price, currency, category_name, availability_status, external_info_url, is_featured, is_published, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  const result = executeRun(`
    INSERT INTO products (name, slug, image_url, description, price, currency, category_name, availability_status, external_info_url, is_featured, is_published, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, finalSlug, image_url || null, description || null, Number(price) || 0, currency || 'د.ل', category_name || null, availability_status || 'متوفر', external_info_url || null, is_featured ? 1 : 0, is_published !== false ? 1 : 0, Number(display_order) || 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المنتج بنجاح' });
});

router.put('/admin/products/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, slug, image_url, description, price, currency, category_name, availability_status, external_info_url, is_featured, is_published, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  const finalSlug = slug ? slugify(slug) : slugify(name);

  executeRun(`
    UPDATE products SET
      name = ?, slug = ?, image_url = ?, description = ?, price = ?, currency = ?, category_name = ?, availability_status = ?, external_info_url = ?, is_featured = ?, is_published = ?, display_order = ?
    WHERE id = ?
  `, [name, finalSlug, image_url || null, description || null, Number(price) || 0, currency || 'د.ل', category_name || null, availability_status || 'متوفر', external_info_url || null, is_featured ? 1 : 0, is_published ? 1 : 0, Number(display_order) || 0, id]);

  return res.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
});

router.delete('/admin/products/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM products WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

// Admin Media Library
router.get('/admin/media', requireAuth, (_req, res) => {
  const media = executeQuery('SELECT * FROM media ORDER BY id DESC');
  return res.json(media);
});

router.post('/admin/media/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'يرجى اختيار ملف صورة صالح' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const result = executeRun(`
    INSERT INTO media (filename, original_name, url, mime_type, size)
    VALUES (?, ?, ?, ?, ?)
  `, [req.file.filename, req.file.originalname, fileUrl, req.file.mimetype, req.file.size]);

  return res.json({
    success: true,
    id: result.lastInsertRowid,
    url: fileUrl,
    message: 'تم رفع الصورة بنجاح'
  });
});

router.delete('/admin/media/:id', requireAuth, (req, res) => {
  const item = executeGet('SELECT * FROM media WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'الصورة غير موجودة' });

  // Check if image is used anywhere
  const inEquipment = executeGet('SELECT count(*) as count FROM equipment WHERE image_url = ?', [item.url])?.count || 0;
  const inTraining = executeGet('SELECT count(*) as count FROM training WHERE image_url = ?', [item.url])?.count || 0;
  const inTrainers = executeGet('SELECT count(*) as count FROM trainers WHERE photo_url = ?', [item.url])?.count || 0;
  const inFacilities = executeGet('SELECT count(*) as count FROM facilities WHERE image_url = ?', [item.url])?.count || 0;
  const inNews = executeGet('SELECT count(*) as count FROM news WHERE cover_image = ?', [item.url])?.count || 0;
  const inProducts = executeGet('SELECT count(*) as count FROM products WHERE image_url = ?', [item.url])?.count || 0;

  const totalUsed = inEquipment + inTraining + inTrainers + inFacilities + inNews + inProducts;

  if (totalUsed > 0 && req.query.force !== 'true') {
    return res.status(409).json({
      error: `هذه الصورة مستخدمة حالياً في ${totalUsed} من عناصر الموقع. يرجى تأكيد الحذف القسري`,
      inUse: true,
      usageCount: totalUsed
    });
  }

  // Delete physical file if exists
  const filePath = path.join(UPLOAD_DIR, item.filename);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
  }

  executeRun('DELETE FROM media WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف الصورة بنجاح' });
});

// Admin Categories Management
router.get('/admin/categories/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const table = type === 'equipment' ? 'equipment_categories'
    : type === 'training' ? 'training_categories'
    : type === 'news' ? 'news_categories'
    : type === 'products' ? 'product_categories' : null;

  if (!table) return res.status(400).json({ error: 'نوع التصنيف غير صالح' });
  const cats = executeQuery(`SELECT * FROM ${table} ORDER BY order_index ASC, id ASC`);
  return res.json(cats);
});

router.post('/admin/categories/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم التصنيف مطلوب' });

  const table = type === 'equipment' ? 'equipment_categories'
    : type === 'training' ? 'training_categories'
    : type === 'news' ? 'news_categories'
    : type === 'products' ? 'product_categories' : null;

  if (!table) return res.status(400).json({ error: 'نوع التصنيف غير صالح' });

  const slug = slugify(name);
  const result = executeRun(`INSERT INTO ${table} (name, slug) VALUES (?, ?)`, [name, slug]);
  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة التصنيف بنجاح' });
});

router.delete('/admin/categories/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params;
  const table = type === 'equipment' ? 'equipment_categories'
    : type === 'training' ? 'training_categories'
    : type === 'news' ? 'news_categories'
    : type === 'products' ? 'product_categories' : null;

  if (!table) return res.status(400).json({ error: 'نوع التصنيف غير صالح' });
  executeRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
});

// Admin Site Settings
router.put('/admin/site-settings', requireAuth, (req, res) => {
  const settings = req.body;
  if (typeof settings !== 'object') {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }

  for (const [key, value] of Object.entries(settings)) {
    executeRun('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, String(value ?? '')]);
  }

  return res.json({ success: true, message: 'تم حفظ إعدادات الموقع بنجاح' });
});

// Admin Social Links
router.get('/admin/social-links', requireAuth, (_req, res) => {
  const links = executeQuery('SELECT * FROM social_links ORDER BY order_index ASC, id ASC');
  return res.json(links);
});

router.post('/admin/social-links', requireAuth, (req, res) => {
  const { platform, url, is_active, order_index } = req.body;
  if (!platform || !url) return res.status(400).json({ error: 'المنصة والرابط مطلوبان' });

  const result = executeRun(`
    INSERT INTO social_links (platform, url, is_active, order_index)
    VALUES (?, ?, ?, ?)
  `, [platform, url, is_active !== false ? 1 : 0, Number(order_index) || 0]);

  return res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة الرابط بنجاح' });
});

router.put('/admin/social-links/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { platform, url, is_active, order_index } = req.body;
  if (!platform || !url) return res.status(400).json({ error: 'المنصة والرابط مطلوبان' });

  executeRun(`
    UPDATE social_links SET
      platform = ?, url = ?, is_active = ?, order_index = ?
    WHERE id = ?
  `, [platform, url, is_active ? 1 : 0, Number(order_index) || 0, id]);

  return res.json({ success: true, message: 'تم تحديث الرابط بنجاح' });
});

router.delete('/admin/social-links/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM social_links WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف الرابط بنجاح' });
});

// Admin Contact Messages
router.get('/admin/contact-messages', requireAuth, (_req, res) => {
  const messages = executeQuery('SELECT * FROM contact_messages ORDER BY id DESC');
  return res.json(messages);
});

router.patch('/admin/contact-messages/:id/toggle-read', requireAuth, (req, res) => {
  const msg = executeGet('SELECT is_read FROM contact_messages WHERE id = ?', [req.params.id]);
  if (!msg) return res.status(404).json({ error: 'الرسالة غير موجودة' });
  const newVal = msg.is_read ? 0 : 1;
  executeRun('UPDATE contact_messages SET is_read = ? WHERE id = ?', [newVal, req.params.id]);
  return res.json({ success: true, is_read: newVal });
});

router.delete('/admin/contact-messages/:id', requireAuth, (req, res) => {
  executeRun('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
  return res.json({ success: true, message: 'تم حذف الرسالة بنجاح' });
});

export default router;
