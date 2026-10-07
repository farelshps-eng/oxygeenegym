import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Dumbbell,
  Send,
  Plus,
  Trash2,
  Sparkles,
  User,
  Clock,
  Apple,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCw,
} from 'lucide-react';
import { Member, TrainerMessage, WorkoutDay, WorkoutExercise, WorkoutPlanDetails } from '../../types';
import { api } from '../../services/api';

interface AdminCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const AdminCoachModal: React.FC<AdminCoachModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'new_plan'>('chat');
  const [messages, setMessages] = useState<TrainerMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Chat send state
  const [chatText, setChatText] = useState('');
  const [trainerName, setTrainerName] = useState('كابتن وليد (مدير الجيم والمدرب العام)');
  const [sendingChat, setSendingChat] = useState(false);

  // Workout Plan form state
  const [planTitle, setPlanTitle] = useState('خطة الضخامة العضلية والقوة - 4 أسابيع');
  const [planFocus, setPlanFocus] = useState('تضخيم وبناء القوة العضلية (Hypertrophy)');
  const [durationWeeks, setDurationWeeks] = useState<number>(4);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [planContent, setPlanContent] = useState(
    'أهلاً بك يا كابتن! هذه خطتك المخصصة للشهر الحالي، احرص على التركيز في الأداء الحركي السليم وزيادة الأوزان تدريجياً.'
  );
  const [dietTips, setDietTips] = useState(
    'احرص على شرب 3 إلى 4 لتر ماء يومياً وتناول 1.8-2 غرام بروتين لكل كيلوغرام من وزن الجسم والنوم 8 ساعات.'
  );
  const [schedule, setSchedule] = useState<WorkoutDay[]>([
    {
      day: 'اليوم الأول: الصدر والترايسبس (Chest & Triceps)',
      exercises: [
        { name: 'بنش برس بار مستوي (Flat Bench Press)', sets: '4 مجموعات', reps: '8-10 تكرار', rest: '90 ثانية' },
        { name: 'دمبل بنش مائل علوي (Incline DB Press)', sets: '3 مجموعات', reps: '10-12 تكرار', rest: '60 ثانية' },
        { name: 'تفتيح كيبل للصدر (Cable Crossover)', sets: '3 مجموعات', reps: '12-15 تكرار', rest: '45 ثانية' },
        { name: 'دفع حبل ترايسبس (Triceps Rope Pushdown)', sets: '4 مجموعات', reps: '12 تكرار', rest: '45 ثانية' },
      ],
    },
    {
      day: 'اليوم الثاني: الظهر والبايسبس (Back & Biceps)',
      exercises: [
        { name: 'سحب بار للظهر (Barbell Row)', sets: '4 مجموعات', reps: '8-10 تكرار', rest: '90 ثانية' },
        { name: 'سحب أمامي عريض (Lat Pulldown)', sets: '4 مجموعات', reps: '10-12 تكرار', rest: '60 ثانية' },
        { name: 'سحب كيبل جالس (Seated Cable Row)', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
        { name: 'تبادل دمبل باي (Hammer Curls)', sets: '4 مجموعات', reps: '12 تكرار', rest: '45 ثانية' },
      ],
    },
  ]);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      loadThread();
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, member?.id]);

  const loadThread = async () => {
    if (!member) return;
    setLoading(true);
    try {
      const res = await api.getAdminMemberMessages(member.id);
      setMessages(res.messages || []);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل رسائل المشترك');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  // Pre-set templates
  const loadTemplate = (type: 'hypertrophy' | 'cutting' | 'starter' | 'combat') => {
    if (type === 'hypertrophy') {
      setPlanTitle('خطة الضخامة العضلية الشاملة - 4 أسابيع');
      setPlanFocus('تضخيم وبناء القوة العضلية (Hypertrophy)');
      setDurationWeeks(4);
      setDaysPerWeek(4);
      setPlanContent('خطة تركز على زيادة الكتلة العضلية بتكنيك تدريجي وفترات راحة منتظمة.');
      setDietTips('شرب 3-4 لتر ماء وزيادة السعرات بفائض نظيف 300-500 سعرة حرارية مع بروتين عالي.');
      setSchedule([
        {
          day: 'اليوم 1: دفع (Push - صدور وأكتاف وتراي)',
          exercises: [
            { name: 'بنش برس بار مستوي', sets: '4 مجموعات', reps: '8-10 تكرار', rest: '90 ثانية' },
            { name: 'ضغط دمبل علوي مائل', sets: '3 مجموعات', reps: '10-12 تكرار', rest: '60 ثانية' },
            { name: 'رفرفة جانبي أكتاف', sets: '4 مجموعات', reps: '15 تكرار', rest: '45 ثانية' },
            { name: 'كيبل ترايسبس', sets: '4 مجموعات', reps: '12 تكرار', rest: '45 ثانية' },
          ],
        },
        {
          day: 'اليوم 2: سحب (Pull - ظهر وبايسبس)',
          exercises: [
            { name: 'سحب بار حر للظهر', sets: '4 مجموعات', reps: '8-10 تكرار', rest: '90 ثانية' },
            { name: 'سحب أمامي عريض', sets: '4 مجموعات', reps: '10-12 تكرار', rest: '60 ثانية' },
            { name: 'مرجحة بار بايسبس EZ', sets: '4 مجموعات', reps: '10-12 تكرار', rest: '60 ثانية' },
          ],
        },
        {
          day: 'اليوم 3: راحة واستشفاء',
          exercises: [{ name: 'سونا وجاكوزي في أوكسجين جيم', sets: '20 دقيقة', reps: '-', rest: '-' }],
        },
        {
          day: 'اليوم 4: أرجل وبطن (Legs & Abs)',
          exercises: [
            { name: 'سكوات بالبار الحر', sets: '4 مجموعات', reps: '8-10 تكرار', rest: '90 ثانية' },
            { name: 'دفع رجلين على الجهاز Leg Press', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
            { name: 'طحن بطن وكور', sets: '4 مجموعات', reps: '15 تكرار', rest: '45 ثانية' },
          ],
        },
      ]);
    } else if (type === 'cutting') {
      setPlanTitle('خطة حرق الدهون والتنشيف العضلي (Cutting)');
      setPlanFocus('خسارة الدهون ونحت القوام واللياقة البدنية');
      setDurationWeeks(4);
      setDaysPerWeek(5);
      setPlanContent('خطة مكثفة بتكرارات أعلى وفترات راحة قصيرة مع كارديو لرفع معدل الحرق اليومي.');
      setDietTips('عجز سعرات حرارية 400 سعرة، تقليل السكريات والدهون المشبعة، وشرب 4 لتر ماء.');
      setSchedule([
        {
          day: 'اليوم 1: الجزء العلوي + كارديو',
          exercises: [
            { name: 'ضغط صدر بالدمبل', sets: '4 مجموعات', reps: '12-15 تكرار', rest: '45 ثانية' },
            { name: 'سحب ظهر كيبل', sets: '4 مجموعات', reps: '12-15 تكرار', rest: '45 ثانية' },
            { name: 'كارديو سير مائل HIIT', sets: '1 مجموعة', reps: '20 دقيقة', rest: '-' },
          ],
        },
        {
          day: 'اليوم 2: الجزء السفلي + عضلات البطن',
          exercises: [
            { name: 'لانجز بالدمبل للمؤخرة والأرجل', sets: '3 مجموعات', reps: '15 خطوة', rest: '45 ثانية' },
            { name: 'جهاز الأرجل الخلفية والخياطة', sets: '4 مجموعات', reps: '15 تكرار', rest: '45 ثانية' },
            { name: 'بلانك + رفع أرجل للبطن', sets: '4 مجموعات', reps: '45 ثانية', rest: '30 ثانية' },
          ],
        },
      ]);
    } else if (type === 'starter') {
      setPlanTitle('خطة التهيئة الشاملة للمشترك الجديد (Starter)');
      setPlanFocus('تهيئة المفاصل وبناء الأساس العضلي');
      setDurationWeeks(4);
      setDaysPerWeek(3);
      setPlanContent('خطة تمرين شامل لكل الجسم لتهيئة العضلات والأوتار للتدريب المنتظم.');
      setDietTips('وجبات متوازنة من البروتين والنشويات المعقدة وتجنب المشروبات الغازية.');
      setSchedule([
        {
          day: 'اليوم 1: تمرين الجسم الكامل (Full Body A)',
          exercises: [
            { name: 'إحماء دراجة أو سير', sets: '1 مجموعة', reps: '10 دقائق', rest: '60 ثانية' },
            { name: 'جهاز دفع الصدر Chest Press', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
            { name: 'جهاز سحب الظهر Lat Pulldown', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
            { name: 'جهاز دفع الأرجل Leg Press', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
          ],
        },
      ]);
    } else if (type === 'combat') {
      setPlanTitle('خطة اللياقة القتالية والملاكمة (Combat Conditioning)');
      setPlanFocus('سرعة رد الفعل والقوة الانفجارية والتحمل');
      setDurationWeeks(4);
      setDaysPerWeek(4);
      setPlanContent('تدريبات خاصة بصالة الملاكمة في أوكسجين جيم مع أكياس الملاكمة وحبل القفز.');
      setDietTips('وجبة طاقة قبل التمرين بساعتين غنية بالكارب مع إلكترولايت أثناء التمرين.');
      setSchedule([
        {
          day: 'اليوم 1: ملاكمة وحقائب الملاكمة الثقيلة (Heavy Bag & Rounds)',
          exercises: [
            { name: 'قفز حبل للإحماء', sets: '3 جولات', reps: '3 دقائق', rest: '60 ثانية' },
            { name: 'ملاكمة ظل Shadow Boxing', sets: '3 جولات', reps: '3 دقائق', rest: '45 ثانية' },
            { name: 'لكمات تركيبية على الكيس الثقيل', sets: '5 جولات', reps: '3 دقائق', rest: '60 ثانية' },
          ],
        },
      ]);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || sendingChat) return;

    setSendingChat(true);
    setError(null);
    try {
      const res = await api.sendAdminMemberMessage(member.id, {
        trainer_name: trainerName,
        message_type: 'chat',
        content: chatText.trim(),
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        setChatText('');
      }
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال الرسالة');
    } finally {
      setSendingChat(false);
    }
  };

  const handleSendPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPlan(true);
    setError(null);
    setSuccessMsg(null);

    const planDetails: WorkoutPlanDetails = {
      focus: planFocus,
      duration_weeks: Number(durationWeeks) || 4,
      days_per_week: Number(daysPerWeek) || 4,
      schedule,
      diet_tips: dietTips,
    };

    try {
      const res = await api.sendAdminMemberMessage(member.id, {
        trainer_name: trainerName,
        message_type: 'workout_plan',
        title: planTitle.trim(),
        content: planContent.trim(),
        plan_details: planDetails,
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        setSuccessMsg('✅ تم إرسال الخطة التدريبية بنجاح إلى ملف المشترك الرياضي!');
        setActiveTab('chat');
      }
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال الخطة التدريبية');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!confirm('هل تريد حذف هذه الرسالة من سجل المشترك؟')) return;
    try {
      await api.deleteAdminMemberMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الرسالة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0d0d15] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-right my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Member Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 mb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                منظومة التدريب والمحادثة للمشترك: {member.full_name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 pt-0.5">
                <span className="font-mono">{member.phone}</span>
                <span>•</span>
                <span className="text-red-400 font-semibold">{member.plan_name || 'غير مشترك'}</span>
                <span>•</span>
                <span>الهدف: {member.fitness_goal || 'عام'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification alerts */}
        {error && (
          <div className="mb-3 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#12121d] p-1.5 rounded-2xl border border-neutral-800 mb-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>المحادثة المباشرة مع المشترك ({messages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new_plan')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'new_plan'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>إرسال خطة تدريبية مخصصة</span>
          </button>
        </div>

        {/* ================= TAB 1: ADMIN CHAT CONVERSATION ================= */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[420px]">
            {/* Coach Selector */}
            <div className="p-2.5 bg-[#141420] border border-neutral-800 rounded-t-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">الإرسال بصفتك:</span>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="bg-[#0a0a10] border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                />
              </div>
              <button
                onClick={loadThread}
                className="p-1 text-neutral-400 hover:text-white"
                title="تحديث المحادثة"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 bg-[#09090f] border-x border-neutral-800 p-3.5 overflow-y-auto space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs text-neutral-500">جاري تحميل المحادثة...</div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 space-y-1">
                  <p>لا توجد رسائل سابقة مع المشترك.</p>
                  <p className="text-[11px] text-neutral-600">
                    يمكنك إرسال أول رسالة ترحيبية أو تحفيزية له الآن!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isCoach = m.sender_type === 'trainer';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCoach ? 'items-end' : 'items-start'} group`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 shadow-md relative ${
                          isCoach
                            ? 'bg-red-950/40 border border-red-800/60 text-neutral-100 rounded-tl-none'
                            : 'bg-[#151522] border border-neutral-700/60 text-neutral-200 rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 border-b border-white/10 pb-1">
                          <span className="font-bold">
                            {isCoach ? m.trainer_name : `المشترك: ${member.full_name}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px]">
                              {new Date(m.created_at).toLocaleTimeString('ar-LY', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="text-neutral-500 hover:text-red-400 p-0.5"
                              title="حذف الرسالة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {m.message_type === 'workout_plan' && (
                          <div className="inline-block px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                            خطة تدريب مرفقة: {m.title}
                          </div>
                        )}

                        <p className="leading-relaxed whitespace-pre-wrap text-[11px]">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendChat}
              className="p-2.5 bg-[#141420] rounded-b-2xl border border-neutral-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={`أرسل رسالة توجيهية أو رد للمشترك ${member.full_name}...`}
                className="flex-1 bg-[#09090f] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatText.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {sendingChat ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 2: SEND CUSTOM WORKOUT PLAN ================= */}
        {activeTab === 'new_plan' && (
          <form onSubmit={handleSendPlan} className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {/* Quick Template Picker */}
            <div className="p-3 bg-[#12121d] rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-[11px] text-neutral-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>نماذج تدريبية جاهزة للتحميل السريع:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => loadTemplate('hypertrophy')}
                  className="p-2 bg-neutral-900 hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-neutral-800 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all"
                >
                  💪 تضخيم وبناء عضلات (4 أيام)
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('cutting')}
                  className="p-2 bg-neutral-900 hover:bg-amber-950/40 text-neutral-300 hover:text-amber-400 border border-neutral-800 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all"
                >
                  🔥 تنشيف وحرق دهون (5 أيام)
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('starter')}
                  className="p-2 bg-neutral-900 hover:bg-emerald-950/40 text-neutral-300 hover:text-emerald-400 border border-neutral-800 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all"
                >
                  ⚡ تهيئة للمبتدئين (3 أيام)
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('combat')}
                  className="p-2 bg-neutral-900 hover:bg-blue-950/40 text-neutral-300 hover:text-blue-400 border border-neutral-800 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all"
                >
                  🥊 ملاكمة وقتال (4 أيام)
                </button>
              </div>
            </div>

            {/* Plan Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">عنوان الخطة</label>
                <input
                  type="text"
                  required
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full bg-[#12121a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">الهدف التدريبي</label>
                <input
                  type="text"
                  value={planFocus}
                  onChange={(e) => setPlanFocus(e.target.value)}
                  className="w-full bg-[#12121a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">أيام التمرين أسبوعياً</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full bg-[#12121a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">مدة الخطة (بالأسابيع)</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full bg-[#12121a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Coach Message / Instructions */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">رسالة وتوجيهات الكابتن للمشترك</label>
              <textarea
                rows={2}
                required
                value={planContent}
                onChange={(e) => setPlanContent(e.target.value)}
                className="w-full bg-[#12121a] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600 leading-relaxed"
              />
            </div>

            {/* Schedule Days Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-red-500" />
                  <span>جدول الأيام والتمارين:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSchedule((prev) => [
                      ...prev,
                      {
                        day: `اليوم ${prev.length + 1}: تدريب جديد`,
                        exercises: [
                          { name: 'اسم التمرين', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
                        ],
                      },
                    ]);
                  }}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة يوم</span>
                </button>
              </div>

              {schedule.map((dayItem, dIdx) => (
                <div key={dIdx} className="p-3 bg-[#12121c] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={dayItem.day}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedule((prev) =>
                          prev.map((d, i) => (i === dIdx ? { ...d, day: val } : d))
                        );
                      }}
                      className="bg-black/40 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-red-400 font-bold flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSchedule((prev) => prev.filter((_, i) => i !== dIdx));
                      }}
                      className="p-1 text-neutral-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-1.5">
                    {dayItem.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="text"
                          value={ex.name}
                          placeholder="اسم التمرين"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSchedule((prev) =>
                              prev.map((d, i) =>
                                i === dIdx
                                  ? {
                                      ...d,
                                      exercises: d.exercises.map((x, j) =>
                                        j === eIdx ? { ...x, name: val } : x
                                      ),
                                    }
                                  : d
                              )
                            );
                          }}
                          className="flex-1 bg-black/30 border border-neutral-800 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={ex.sets}
                          placeholder="المجموعات"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSchedule((prev) =>
                              prev.map((d, i) =>
                                i === dIdx
                                  ? {
                                      ...d,
                                      exercises: d.exercises.map((x, j) =>
                                        j === eIdx ? { ...x, sets: val } : x
                                      ),
                                    }
                                  : d
                              )
                            );
                          }}
                          className="w-24 bg-black/30 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200"
                        />
                        <input
                          type="text"
                          value={ex.reps}
                          placeholder="التكرارات"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSchedule((prev) =>
                              prev.map((d, i) =>
                                i === dIdx
                                  ? {
                                      ...d,
                                      exercises: d.exercises.map((x, j) =>
                                        j === eIdx ? { ...x, reps: val } : x
                                      ),
                                    }
                                  : d
                              )
                            );
                          }}
                          className="w-24 bg-black/30 border border-neutral-800 rounded px-2 py-1 text-xs text-red-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule((prev) =>
                              prev.map((d, i) =>
                                i === dIdx
                                  ? {
                                      ...d,
                                      exercises: d.exercises.filter((_, j) => j !== eIdx),
                                    }
                                  : d
                              )
                            );
                          }}
                          className="p-1 text-neutral-600 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSchedule((prev) =>
                          prev.map((d, i) =>
                            i === dIdx
                              ? {
                                  ...d,
                                  exercises: [
                                    ...d.exercises,
                                    { name: '', sets: '3 مجموعات', reps: '12 تكرار', rest: '60 ثانية' },
                                  ],
                                }
                              : d
                          )
                        );
                      }}
                      className="text-[10px] text-red-400 hover:underline pt-1 block"
                    >
                      + إضافة تمرين لهذا اليوم
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Diet Tips */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-emerald-400" />
                <span>نصائح التغذية والاستشفاء المرفقة:</span>
              </label>
              <textarea
                rows={2}
                value={dietTips}
                onChange={(e) => setDietTips(e.target.value)}
                className="w-full bg-[#12121a] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600 leading-relaxed"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingPlan}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40 transition-all"
              >
                {submittingPlan ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Dumbbell className="w-4 h-4" />
                    <span>إرسال الخطة التدريبية للمشترك في حسابه الآن</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
