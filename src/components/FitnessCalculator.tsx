import React, { useState } from 'react';
import {
  Calculator,
  Flame,
  Activity,
  Heart,
  Droplets,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Dumbbell,
  Target,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FitnessCalculatorProps {
  onNavigateToMemberships?: () => void;
  onNavigateToTrainers?: () => void;
}

export const FitnessCalculator: React.FC<FitnessCalculatorProps> = ({
  onNavigateToMemberships,
  onNavigateToTrainers,
}) => {
  const { lang, t } = useLanguage();
  const isRtl = lang === 'ar';

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(75);
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // 1.2, 1.375, 1.55, 1.725
  const [fitnessGoal, setFitnessGoal] = useState<'bulk' | 'cut' | 'maintain'>('bulk');
  const [calculated, setCalculated] = useState<boolean>(true);

  // Calculations:
  // BMI = weight / (height in m)^2
  const heightM = height / 100;
  const bmi = heightM > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 22;

  // Ideal weight range based on BMI 18.5 - 24.9
  const idealMinWeight = Math.round(18.5 * heightM * heightM);
  const idealMaxWeight = Math.round(24.9 * heightM * heightM);

  // BMR: Mifflin-St Jeor Formula
  // Male: 10 * weight + 6.25 * height - 5 * age + 5
  // Female: 10 * weight + 6.25 * height - 5 * age - 161
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  // TDEE = BMR * activityLevel
  const tdee = Math.round(bmr * activityLevel);

  // Target Calories based on Goal
  let targetCalories = tdee;
  let targetProtein = Math.round(weight * 2.0); // 2g per kg for bulking
  let adviceAr = '';
  let adviceEn = '';

  if (fitnessGoal === 'bulk') {
    targetCalories = tdee + 350;
    targetProtein = Math.round(weight * 2.0);
    adviceAr =
      'هدفك الضخامة العضلية: احرص على فائض حراري نظيف بزيادة 350 سعرة يومياً مع التركيز على تمارين المقاومة والأوزان الحرة مع كابتن وليد.';
    adviceEn =
      'Muscle building goal: maintain a clean surplus of +350 kcal daily and prioritize progressive overload with compound lifts.';
  } else if (fitnessGoal === 'cut') {
    targetCalories = Math.max(1200, tdee - 450);
    targetProtein = Math.round(weight * 2.2);
    adviceAr =
      'هدفك التنشيف وخسارة الدهون: التزم بعجز حراري 450 سعرة مع رفع نسبة البروتين لحماية كتلتك العضلية وممارسة حصص الملاكمة والكارديو في الصالة.';
    adviceEn =
      'Fat loss goal: follow a deficit of 450 kcal with elevated protein intake and include high-intensity cardio / boxing sessions.';
  } else {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.6);
    adviceAr =
      'هدفك اللياقة والثبات: توازن سعرات ممتاز يحافظ على طاقتك وحيويتك، مع تنويع التمارين بين القوة والمرونة وتدريبات الأجهزة.';
    adviceEn =
      'Maintenance goal: balanced calories to sustain optimum energy, alternating between strength, agility, and recovery.';
  }

  const waterIntakeLiters = ((weight * 35) / 1000).toFixed(1);

  // BMI status metadata
  let bmiCategory = {
    titleAr: 'وزن مثالي متناسق',
    titleEn: 'Normal / Athletic',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    progress: 50,
  };

  if (bmi < 18.5) {
    bmiCategory = {
      titleAr: 'أقل من الوزن الطبيعي',
      titleEn: 'Underweight',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      progress: 20,
    };
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = {
      titleAr: 'زيادة وزن أو كتلة عضلية',
      titleEn: 'Overweight / Muscular',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30',
      progress: 75,
    };
  } else if (bmi >= 30) {
    bmiCategory = {
      titleAr: 'سمنة تتطلب برنامج تخسيس',
      titleEn: 'High BMI / Needs Cut',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      progress: 95,
    };
  }

  return (
    <div className="w-full bg-[#0d0d14] border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{t('أداة رياضية تفاعلية مجانية', 'Free Athletic Tool')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
              {t('حاسبة اللياقة، الكتلة والسعرات', 'Fitness, BMI & Calorie Calculator')}
            </h3>
            <p className="text-xs text-neutral-400">
              {t(
                'احسب احتياج جسمك بدقة واحصل على توجيه غذائي وتدريبي مباشر من كابتن وليد',
                'Calculate your body metrics and get instant workout and nutrition targets'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setAge(25);
            setHeight(175);
            setWeight(75);
            setFitnessGoal('bulk');
          }}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('إعادة ضبط', 'Reset')}</span>
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left / Input Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Gender & Goal Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                {t('الجنس', 'Gender')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-red-600/20 border-red-600 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t('ذكر 👨', 'Male 👨')}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-red-600/20 border-red-600 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t('أنثى 👩', 'Female 👩')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                {t('الهدف الرياضي', 'Fitness Goal')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFitnessGoal('bulk')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                    fitnessGoal === 'bulk'
                      ? 'bg-red-600/25 border-red-500 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t('ضخامة 💪', 'Bulk 💪')}
                </button>
                <button
                  type="button"
                  onClick={() => setFitnessGoal('cut')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                    fitnessGoal === 'cut'
                      ? 'bg-red-600/25 border-red-500 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t('تنشيف 🔥', 'Cut 🔥')}
                </button>
                <button
                  type="button"
                  onClick={() => setFitnessGoal('maintain')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                    fitnessGoal === 'maintain'
                      ? 'bg-red-600/25 border-red-500 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t('لياقة ⚡', 'Fitness ⚡')}
                </button>
              </div>
            </div>
          </div>

          {/* Sliders: Height, Weight, Age */}
          <div className="space-y-4">
            {/* Weight */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
                <span>{t('الوزن الحالي', 'Current Weight')}</span>
                <span className="font-mono text-base text-red-400">{weight} كغ</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>40 kg</span>
                <span>100 kg</span>
                <span>160 kg</span>
              </div>
            </div>

            {/* Height */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
                <span>{t('الطول', 'Height')}</span>
                <span className="font-mono text-base text-red-400">{height} سم</span>
              </div>
              <input
                type="range"
                min="130"
                max="210"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>130 cm</span>
                <span>170 cm</span>
                <span>210 cm</span>
              </div>
            </div>

            {/* Age */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
                <span>{t('العمر', 'Age')}</span>
                <span className="font-mono text-base text-red-400">{age} سنة</span>
              </div>
              <input
                type="range"
                min="14"
                max="75"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                {t('مستوى النشاط اليومي والتدريب', 'Daily Training Activity')}
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full bg-[#13131a] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value={1.2}>خامل (قليل الحركة أو عمل مكتبي)</option>
                <option value={1.375}>نشاط خفيف (تمرين 1-3 أيام بالأسبوع)</option>
                <option value={1.55}>نشاط متوسط (تمرين 3-5 أيام في الجيم)</option>
                <option value={1.725}>نشاط عالي / بطل رياضي (تمرين 6-7 أيام)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right / Results Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Main Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* BMI Card */}
            <div className={`p-4 rounded-2xl border ${bmiCategory.bg} space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">{t('مؤشر الكتلة (BMI)', 'Body Mass Index')}</span>
                <Activity className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {bmi}
              </div>
              <div className={`text-xs font-bold ${bmiCategory.color}`}>
                {lang === 'ar' ? bmiCategory.titleAr : bmiCategory.titleEn}
              </div>
            </div>

            {/* Target Calories */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">{t('السعرات المستهدفة', 'Target Calories')}</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-black font-mono text-orange-400 tracking-tight">
                {targetCalories}
              </div>
              <div className="text-xs font-bold text-neutral-400">
                {t('سعرة حرارية / يومياً', 'kcal / day')}
              </div>
            </div>

            {/* Daily Protein */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">{t('البروتين المطلوب', 'Daily Protein')}</span>
                <Dumbbell className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-black font-mono text-red-400 tracking-tight">
                {targetProtein}g
              </div>
              <div className="text-xs font-bold text-neutral-400">
                {t('جرام بروتين يومياً', 'grams protein daily')}
              </div>
            </div>

            {/* Water & Ideal Weight */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">{t('الماء والوزن المثالي', 'Water & Ideal Weight')}</span>
                <Droplets className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400 tracking-tight">
                {waterIntakeLiters} لتر
              </div>
              <div className="text-[11px] font-semibold text-neutral-400">
                المثالي: {idealMinWeight} - {idealMaxWeight} كغ
              </div>
            </div>
          </div>

          {/* Coach Advice Box */}
          <div className="p-4 rounded-2xl bg-[#13131c] border border-neutral-800 relative">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-xs shrink-0">
                W
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>كابتن وليد</span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-red-600/20 text-red-300 border border-red-500/30">
                    نصيحة التدريب
                  </span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {lang === 'ar' ? adviceAr : adviceEn}
                </p>
              </div>
            </div>
          </div>

          {/* CTA actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onNavigateToMemberships && (
              <button
                type="button"
                onClick={onNavigateToMemberships}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t('اختر باقة الاشتراك المناسبة', 'View Membership Plans')}</span>
                {isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {onNavigateToTrainers && (
              <button
                type="button"
                onClick={onNavigateToTrainers}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4 text-red-500" />
                <span>{t('تحدث مع المدربين', 'Meet Coaches')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
