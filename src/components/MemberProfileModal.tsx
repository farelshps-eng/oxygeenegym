import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  LogOut,
  MapPin,
  Flame,
  Award,
  Edit2,
  Save,
  QrCode,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  Dumbbell,
  Send,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Apple,
  Check,
  CheckCheck,
  HelpCircle,
  RotateCw,
  Target,
  Zap,
  Paperclip,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { Member, MemberNotification, TrainerMessage, WorkoutPlanDetails, WorkoutExercise, WorkoutDay } from '../types';
import { api, clearMemberToken } from '../services/api';
import { GymLogo } from './GymLogo';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  notifications: MemberNotification[];
  onLogout: () => void;
  onUpdateMember: (updated: Member) => void;
  onNavigateToLocation?: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  notifications,
  onLogout,
  onUpdateMember,
  onNavigateToLocation,
}) => {
  // Tabs: 'chat' (My Trainer Chat) | 'card' (Member Pass & Info)
  const [activeTab, setActiveTab] = useState<'chat' | 'card'>('chat');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(member.full_name);
  const [email, setEmail] = useState(member.email || '');
  const [age, setAge] = useState(member.age?.toString() || '');
  const [fitnessGoal, setFitnessGoal] = useState(member.fitness_goal || '');
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);

  // Chat & Training Plans state
  const [messages, setMessages] = useState<TrainerMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<number, boolean>>({});
  const [confirmingPlanId, setConfirmingPlanId] = useState<number | null>(null);

  // Plan Attachment Drawer State in Member Chat
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [attachedPlan, setAttachedPlan] = useState<WorkoutPlanDetails | null>(null);
  const [planFocus, setPlanFocus] = useState<string>(member.fitness_goal || 'بناء أجسام وضخامة عضلية');
  const [planDays, setPlanDays] = useState<number>(4);
  const [planDuration, setPlanDuration] = useState<number>(4);
  const [planDietTips, setPlanDietTips] = useState<string>('التركيز على 150-180غ بروتين يومياً، وتناول وجبة غنية بالكربوهيدرات المعقدة قبل التمرين بـ ساعتين.');
  const [planExercises, setPlanExercises] = useState<Array<{ name: string; sets: string; reps: string; rest: string }>>([
    { name: 'بنش برس بالبار المستوي (Barbell Bench Press)', sets: '4 جولات', reps: '8-10 تكرار', rest: '90 ثانية' },
    { name: 'سحب ظهر بالبار المنحني (Barbell Row)', sets: '4 جولات', reps: '10-12 تكرار', rest: '75 ثانية' },
    { name: 'سكوات بالبار (Barbell Squat)', sets: '4 جولات', reps: '8-10 تكرار', rest: '90 ثانية' },
    { name: 'ضغط كتف دمبلز جالس (Seated DB Shoulder Press)', sets: '3 جولات', reps: '10-12 تكرار', rest: '60 ثانية' },
  ]);
  const [newExName, setNewExName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive in chat tab
    if (activeTab === 'chat') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, activeTab]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await api.getMemberMessages();
      setMessages(res.messages || []);
      setUnreadCount(res.unreadCount || 0);

      // Auto expand latest workout plans
      const newExpanded: Record<number, boolean> = {};
      (res.messages || []).forEach((m) => {
        if (m.message_type === 'workout_plan') {
          newExpanded[m.id] = true;
        }
      });
      setExpandedPlanIds(newExpanded);
    } catch (err) {
      console.error('Failed to load trainer messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
    forcedType?: 'chat' | 'plan_request' | 'workout_plan'
  ) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput.trim();

    // If there is an attached plan, allow sending even if text is empty or auto-fill
    if (!textToSend && !attachedPlan) return;
    if (sendingMsg) return;

    setSendingMsg(true);
    try {
      const isWorkoutPlan = !!attachedPlan || forcedType === 'workout_plan';
      const msgType = forcedType || (isWorkoutPlan ? 'workout_plan' : 'chat');

      const messageContent = textToSend || (
        attachedPlan 
          ? `كابتن وليد، أرفقت لك مقترح الخطة التدريبية التالية: (${attachedPlan.focus}) لتبدي رأيك وتوجيهاتك.` 
          : 'رسالة من المشترك'
      );

      const res = await api.sendMemberMessage({
        content: messageContent,
        trainer_name: 'كابتن وليد (مدير الجيم والمدرب العام)',
        message_type: msgType,
        title: msgType === 'plan_request' 
          ? 'طلب خطة تدريبية جديدة' 
          : isWorkoutPlan 
          ? `خطة تدريبية مرفقة: ${attachedPlan?.focus || 'برنامج تمرين'}`
          : undefined,
        plan_details: attachedPlan || undefined,
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        if (!customText) setChatInput('');
        setAttachedPlan(null);
        setIsAttachmentOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إرسال الرسالة، يرجى المحاولة ثانية');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleConfirmPlan = async (planId: number) => {
    setConfirmingPlanId(planId);
    try {
      const res = await api.confirmWorkoutPlan(planId);
      if (res.confirmationMessage) {
        setMessages((prev) => [
          ...prev.map((m) => (m.id === planId ? { ...m, is_read: 1 } : m)),
          res.confirmationMessage,
        ]);
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err: any) {
      alert(err.message || 'تعذر تأكيد استلام الخطة');
    } finally {
      setConfirmingPlanId(null);
    }
  };

  const togglePlanExpansion = (id: number) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAttachCustomPlan = () => {
    const formattedExercises: WorkoutExercise[] = planExercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
    }));

    const builtPlan: WorkoutPlanDetails = {
      focus: planFocus,
      days_per_week: planDays,
      duration_weeks: planDuration,
      diet_tips: planDietTips,
      schedule: [
        {
          day: 'اليوم الأول: العضلات الأساسية والقوة',
          exercises: formattedExercises,
        },
        {
          day: 'اليوم الثاني: تمارين العضلات المكملة واللياقة',
          exercises: formattedExercises.slice().reverse(),
        },
      ],
    };

    setAttachedPlan(builtPlan);
    setIsAttachmentOpen(false);
  };

  const handleAddExerciseToPlan = () => {
    if (!newExName.trim()) return;
    setPlanExercises((prev) => [
      ...prev,
      {
        name: newExName.trim(),
        sets: '3 جولات',
        reps: '10-12 تكرار',
        rest: '60 ثانية',
      },
    ]);
    setNewExName('');
  };

  const handleRemoveExercise = (idx: number) => {
    setPlanExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditMsg(null);
    try {
      const res = await api.updateMemberProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        age: age ? Number(age) : undefined,
        fitness_goal: fitnessGoal.trim() || undefined,
      });
      onUpdateMember(res.member);
      setIsEditing(false);
      setEditMsg('تم حفظ التعديلات بنجاح');
    } catch (err: any) {
      setEditMsg(err.message || 'فشل التحديث');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (member.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>اشتراك نشط ({member.days_left ?? 0} يوماً)</span>
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>يقترب الانتهاء ({member.days_left ?? 0} أيام)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>الاشتراك منتهي</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 border border-neutral-700 text-neutral-400">
            <span>غير مشترك حالياً</span>
          </span>
        );
    }
  };

  const workoutPlansCount = messages.filter((m) => m.message_type === 'workout_plan').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl bg-[#08080e] border border-neutral-800 rounded-3xl p-3.5 sm:p-6 shadow-2xl shadow-red-950/30 text-right flex flex-col h-[94dvh] sm:h-[88vh] max-h-[94dvh]">
        {/* Close Button - Enhanced 44px mobile touch target */}
        <button
          onClick={onClose}
          type="button"
          aria-label="إغلاق النافذة"
          className="absolute top-3 left-3 p-3 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:scale-90 transition-all cursor-pointer z-30 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800/80 pb-3 mb-3 gap-2 pr-1 shrink-0">
          <div className="flex items-center gap-3">
            <GymLogo size="sm" showText={false} />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-heading">
                الملف الرياضي وبوابة المشترك
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <span>{member.full_name}</span>
                <span>•</span>
                <span className="text-red-400">#{member.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* ================= DEDICATED TABS WITH HIGH-TACTILE MOBILE TOUCH ================= */}
        <div className="flex bg-[#11111b] p-1 rounded-2xl border border-neutral-800 mb-3 gap-1 shrink-0">
          {/* My Trainer Chat Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-3 min-h-[46px] text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative touch-manipulation active:scale-[0.98] ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/60 font-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-white shrink-0" />
            <span>دردشة مدربي الشخصي</span>
            <span className="hidden sm:inline text-[11px] opacity-85">(My Trainer Chat)</span>
            {workoutPlansCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-black/50 text-[10px] font-mono text-red-200 border border-red-400/30">
                {workoutPlansCount} خطة
              </span>
            )}
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse absolute top-2 left-2 ring-2 ring-[#08080e]" />
            )}
          </button>

          {/* Member Card Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2.5 px-3 min-h-[46px] text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative touch-manipulation active:scale-[0.98] ${
              activeTab === 'card'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/60 font-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <User className="w-4 h-4 text-white shrink-0" />
            <span>بطاقة العضوية والاشتراك</span>
          </button>
        </div>

        {/* ================= TAB 1: MY TRAINER CHAT & WORKOUT PLANS STREAM ================= */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#0a0a12] border border-neutral-800/90 rounded-2xl shadow-inner relative">
            {/* Chat Room Coach Header */}
            <div className="p-3 bg-[#12121e] border-b border-neutral-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-red-950/50">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#12121e] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>كابتن وليد</span>
                    <span className="px-2 py-0.5 bg-red-600/25 text-red-300 rounded-md text-[10px] font-semibold border border-red-500/40">
                      المدرب المشرف العام
                    </span>
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400">
                    صالة أوكسجين جيم • محادثة تدريبية، إرفاق واستلام الخطط ومتابعة التقدم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadMessages}
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer touch-manipulation active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="تحديث المحادثة"
              >
                <RotateCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin text-red-500' : ''}`} />
              </button>
            </div>

            {/* Quick Action Suggestion Chips - Touch-optimized horizontally scrollable */}
            <div className="px-3 py-2 bg-[#0e0e18] border-b border-neutral-800/70 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs overscroll-contain">
              <span className="text-neutral-500 text-[11px] whitespace-nowrap pl-1 font-bold">طلب سريع:</span>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    `كابتن وليد، أرجو إعداد خطة تدريبية جديدة تناسب هدفي الحالي (${member.fitness_goal || 'اللياقة والقوة'}) وتحديد أيام التمرين لهذا الأسبوع.`,
                    'plan_request'
                  )
                }
                className="px-3 py-2 min-h-[38px] rounded-xl bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-300 border border-red-800/60 whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1.5 touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>طلب خطة تمرين جديدة</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                className="px-3 py-2 min-h-[38px] rounded-xl bg-amber-950/40 hover:bg-amber-900/60 active:scale-95 text-amber-300 border border-amber-800/60 whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1.5 touch-manipulation"
              >
                <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                <span>إرفاق خطة أو مواصفات</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    'كابتن، كيف جدول الراحة الأنسب بين المجموعات؟ وهل أحتاج زيادة الوزن في التكرار الأخير؟'
                  )
                }
                className="px-3 py-2 min-h-[38px] rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-neutral-300 border border-neutral-800 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>استفسار عن التمرين</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    'كابتن، ما هي أفضل نصائح التغذية وكمية البروتين التي تنصحني بها مع خطة التمرين؟'
                  )
                }
                className="px-3 py-2 min-h-[38px] rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-neutral-300 border border-neutral-800 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation"
              >
                <Apple className="w-3.5 h-3.5 text-emerald-400" />
                <span>طلب نصائح تغذية</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    'أنا جاهز وملتزم بتمرين اليوم في صالة أوكسجين جيم يا كابتن! 💪'
                  )
                }
                className="px-3 py-2 min-h-[38px] rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-neutral-300 border border-neutral-800 whitespace-nowrap transition-all cursor-pointer touch-manipulation"
              >
                🔥 جاهز للتمرين اليوم
              </button>
            </div>

            {/* Chat Stream / Message Feed */}
            <div
              ref={chatScrollContainerRef}
              className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-[#06060a] overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loadingMessages ? (
                <div className="py-20 text-center text-neutral-500 text-xs flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري تحميل صندوق الرسائل والخطط التدريبية...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center space-y-3 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600 shadow-md">
                    <MessageSquare className="w-7 h-7 text-red-500/80" />
                  </div>
                  <h4 className="text-sm font-bold text-white">لا توجد رسائل سابقة بعد</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    ابدأ المحادثة الآن مع كابتن وليد أو كابتن علي. يمكنك إرسال استفسارك أو طلب خطة جديدة أو إرفاق مواصفات جدولك الرياضي بضغطة زر.
                  </p>
                </div>
              ) : (
                messages.map((msgItem) => {
                  const isTrainer = msgItem.sender_type === 'trainer';
                  const isPlan = msgItem.message_type === 'workout_plan' || !!msgItem.plan_details;
                  const isRequest = msgItem.message_type === 'plan_request';
                  const planDetails: WorkoutPlanDetails | null = msgItem.plan_details || null;
                  const isExpanded = !!expandedPlanIds[msgItem.id];

                  return (
                    <div
                      key={msgItem.id}
                      className={`flex flex-col ${isTrainer ? 'items-start' : 'items-end'} animate-fadeIn`}
                    >
                      {/* Message Bubble Container */}
                      <div
                        className={`max-w-[94%] sm:max-w-[85%] rounded-2xl text-xs shadow-lg transition-all ${
                          isPlan
                            ? 'w-full bg-[#12121d] border border-red-900/50 rounded-tr-none text-white'
                            : isTrainer
                            ? 'bg-[#151524] border border-red-950/80 text-neutral-200 rounded-tr-none'
                            : isRequest
                            ? 'bg-gradient-to-r from-red-950/70 to-neutral-900 border border-red-700/60 text-white rounded-tl-none'
                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tl-none shadow-red-950/40'
                        }`}
                      >
                        {/* Bubble Header */}
                        <div
                          className={`p-3 pb-2 flex items-center justify-between border-b ${
                            isTrainer ? 'border-white/10' : 'border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isPlan ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/30 text-red-300 font-bold text-[10px] border border-red-500/40">
                                <Dumbbell className="w-3 h-3" />
                                <span>{isTrainer ? 'خطة تدريبية مخصصة من المدرب' : 'خطة تدريبية مرفقة من المشترك'}</span>
                              </span>
                            ) : isRequest ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                                <Sparkles className="w-3 h-3" />
                                <span>طلب خطة من المشترك</span>
                              </span>
                            ) : (
                              <span className="font-bold text-[11px] sm:text-xs">
                                {isTrainer ? msgItem.trainer_name : 'أنت (المشترك)'}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[9px] opacity-75">
                            {new Date(msgItem.created_at).toLocaleTimeString('ar-LY', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Bubble Content Body */}
                        <div className="p-3 sm:p-3.5 space-y-2.5">
                          {/* Main Text Content */}
                          <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                            {msgItem.content}
                          </p>

                          {/* ================= WORKOUT PLAN ATTACHMENT CARD INSIDE CHAT ================= */}
                          {isPlan && (
                            <div className="pt-2.5 border-t border-neutral-800/90 space-y-3">
                              {/* Plan Title & Toggle Button */}
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-xs sm:text-sm font-black text-red-400 font-heading">
                                    {msgItem.title || 'جدول التمارين المعتمد'}
                                  </h4>
                                  {planDetails?.focus && (
                                    <p className="text-[11px] text-neutral-300 flex items-center gap-1 mt-0.5">
                                      <Target className="w-3 h-3 text-red-500 shrink-0" />
                                      <span>الهدف: {planDetails.focus}</span>
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => togglePlanExpansion(msgItem.id)}
                                  className="px-3 py-1.5 min-h-[36px] rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-95 text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all touch-manipulation"
                                >
                                  <span>{isExpanded ? 'طي التمارين' : 'عرض التمارين'}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {/* Plan Meta Badges */}
                              {planDetails && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
                                    <span className="text-neutral-400">أيام التمرين:</span>
                                    <span className="font-bold text-white font-mono">
                                      {planDetails.days_per_week || 4} أيام / أسبوع
                                    </span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-800 flex items-center justify-between">
                                    <span className="text-neutral-400">مدة الدورة:</span>
                                    <span className="font-bold text-emerald-400 font-mono">
                                      {planDetails.duration_weeks || 4} أسابيع
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Daily Schedule Expandable View */}
                              {isExpanded && planDetails?.schedule && planDetails.schedule.length > 0 && (
                                <div className="space-y-2.5 pt-1">
                                  {planDetails.schedule.map((dayItem, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className="p-3 rounded-xl bg-black/60 border border-neutral-800 space-y-2"
                                    >
                                      <div className="flex items-center justify-between text-xs font-bold text-red-400 border-b border-neutral-800/80 pb-1.5">
                                        <span>{dayItem.day}</span>
                                        <span className="text-[10px] text-neutral-400 font-mono">
                                          {dayItem.exercises?.length || 0} تمارين
                                        </span>
                                      </div>

                                      <div className="space-y-1.5">
                                        {dayItem.exercises?.map((ex, eIdx) => (
                                          <div
                                            key={eIdx}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/60 text-xs gap-1"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="w-5 h-5 rounded-md bg-red-600/25 text-red-400 font-mono text-[10px] flex items-center justify-center font-bold">
                                                {eIdx + 1}
                                              </span>
                                              <span className="font-medium text-neutral-200">
                                                {ex.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-400 pr-7 sm:pr-0">
                                              <span className="px-2 py-0.5 rounded bg-black/50 text-neutral-300 font-mono">
                                                {ex.sets}
                                              </span>
                                              <span className="px-2 py-0.5 rounded bg-black/50 text-red-300 font-mono">
                                                {ex.reps}
                                              </span>
                                              {ex.rest && (
                                                <span className="text-neutral-400 text-[10px]">
                                                  راحة: {ex.rest}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Nutrition Advice */}
                              {isExpanded && planDetails?.diet_tips && (
                                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-200 flex items-start gap-2.5">
                                  <Apple className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="block text-emerald-300 mb-0.5">إرشادات التغذية والاستشفاء:</strong>
                                    <span>{planDetails.diet_tips}</span>
                                  </div>
                                </div>
                              )}

                              {/* Confirm Receipt Action Button (if sent by trainer) */}
                              {isTrainer && (
                                <div className="pt-1 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    disabled={confirmingPlanId === msgItem.id}
                                    onClick={() => handleConfirmPlan(msgItem.id)}
                                    className="flex-1 py-2.5 px-4 min-h-[44px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98]"
                                  >
                                    {confirmingPlanId === msgItem.id ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCheck className="w-4 h-4 text-emerald-300" />
                                        <span>تأكيد استلام الخطة والبدء بالتمارين</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ================= ATTACHMENT DRAWER (When Member Clicks Paperclip) ================= */}
            {isAttachmentOpen && (
              <div className="bg-[#12121e] border-t border-red-900/50 p-3 sm:p-4 space-y-3 shrink-0 animate-fadeIn max-h-[45vh] overflow-y-auto overscroll-contain">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                    <Paperclip className="w-4 h-4 text-red-500" />
                    <span>إرفاق خطة تدريبية أو مواصفات تمرين (Attach Plan Spec)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAttachmentOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Plan Goal Chips & Input */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-bold">
                    الهدف الأساسي من الخطة المرفقة:
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'بناء أجسام وضخامة عضلية',
                      'تنشيف وخسارة دهون مع الحفاظ على العضل',
                      'زيادة القوة البدنية وتحسين الأداء',
                      'تأهيل ولياقة عامة ومرونة',
                    ].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPlanFocus(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all touch-manipulation ${
                          planFocus === g
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={planFocus}
                    onChange={(e) => setPlanFocus(e.target.value)}
                    placeholder="أو اكتب هدفك المخصص..."
                    className="w-full bg-[#0a0a10] border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Days & Duration Selectors */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-bold">أيام التمرين بالأسبوع:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPlanDays(num)}
                          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer touch-manipulation min-h-[40px] ${
                            planDays === num
                              ? 'bg-red-600 text-white font-black'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                          }`}
                        >
                          {num} أيام
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-bold">مدة البرنامج المقترحة:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 4, 6, 8].map((weeks) => (
                        <button
                          key={weeks}
                          type="button"
                          onClick={() => setPlanDuration(weeks)}
                          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer touch-manipulation min-h-[40px] ${
                            planDuration === weeks
                              ? 'bg-red-600 text-white font-black'
                              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                          }`}
                        >
                          {weeks} أسابيع
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Exercises list in plan */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-neutral-400 font-bold">
                      التمارين المحددة بالخطة ({planExercises.length}):
                    </label>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {planExercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-red-600/20 text-red-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-white truncate font-medium">{ex.name}</span>
                          <span className="text-neutral-500 text-[10px] shrink-0 font-mono">
                            ({ex.sets} × {ex.reps})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add exercise input */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      placeholder="أضف تمريناً مخصصاً (مثال: ديدليفت بالبار)..."
                      className="flex-1 bg-[#09090f] border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddExerciseToPlan}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[40px] touch-manipulation"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>

                {/* Diet Tips */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-bold">ملاحظات التغذية أو الاستشفاء:</label>
                  <input
                    type="text"
                    value={planDietTips}
                    onChange={(e) => setPlanDietTips(e.target.value)}
                    className="w-full bg-[#0a0a10] border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Action Button: Confirm & Attach */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAttachCustomPlan}
                    className="flex-1 py-3 px-4 min-h-[46px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40 touch-manipulation active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4" />
                    <span>تثبيت وإرفاق الخطة بالرسالة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAttachmentOpen(false)}
                    className="px-4 py-3 min-h-[46px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer touch-manipulation"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Attached Plan Chip Preview above input if attached */}
            {attachedPlan && (
              <div className="px-3 py-2 bg-red-950/30 border-t border-red-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs text-white">
                  <Paperclip className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold text-red-300">خطة مرفقة جاهزة للإرسال:</span>
                  <span className="text-neutral-300 truncate max-w-[200px] sm:max-w-xs">
                    {attachedPlan.focus} ({attachedPlan.days_per_week} أيام/أسبوع)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedPlan(null)}
                  className="text-neutral-400 hover:text-red-400 p-1 rounded-md text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="text-[10px]">إلغاء الإرفاق</span>
                </button>
              </div>
            )}

            {/* ================= MESSAGE INPUT AREA SUPPORTING TEXT & PLAN ATTACHMENTS ================= */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="p-2 sm:p-3 bg-[#0d0d16] border-t border-neutral-800/90 flex items-center gap-2 shrink-0"
            >
              {/* Attachment Toggle Button */}
              <button
                type="button"
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                className={`p-3 min-h-[46px] min-w-[46px] rounded-xl border transition-all cursor-pointer flex items-center justify-center touch-manipulation active:scale-95 ${
                  attachedPlan || isAttachmentOpen
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                    : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
                }`}
                title="إرفاق خطة تدريبية أو مواصفات جدول (Attach Plan)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Text Input - 16px font on phone to prevent iOS auto-zoom */}
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  attachedPlan
                    ? 'أضف رسالتك أو استفسارك مع الخطة المرفقة...'
                    : 'اكتب استفسارك أو رسالتك للكابتن...'
                }
                className="flex-1 bg-[#07070b] border border-neutral-800 rounded-xl px-3.5 py-3 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-colors min-h-[46px]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={sendingMsg || (!chatInput.trim() && !attachedPlan)}
                className="px-4 sm:px-5 py-3 min-h-[46px] bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-950/40 touch-manipulation shrink-0"
              >
                {sendingMsg ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">إرسال</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 2: ATHLETE CARD & SUBSCRIPTION DETAILS ================= */}
        {activeTab === 'card' && (
          <div
            className="space-y-4 overflow-y-auto flex-1 pr-1 animate-fadeIn overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Athlete Digital Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#1c1c28] via-[#12121c] to-[#08080d] border border-neutral-700/60 p-4 sm:p-5 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-52 h-52 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-red-400 font-bold">
                    OXYGEN ATHLETE PASS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1 font-heading">
                    {member.full_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-0.5">{member.phone}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/50 border border-neutral-700/60 flex items-center justify-center p-2.5 text-white/90 shadow-md">
                  <QrCode className="w-full h-full" />
                </div>
              </div>

              {/* Card Plan & Details */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-3.5 border-t border-neutral-800/80 relative z-10 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] sm:text-[11px]">نوع الباقة</span>
                  <span className="font-bold text-white block mt-0.5 truncate text-xs sm:text-sm">
                    {member.plan_name || 'غير مشترك'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] sm:text-[11px]">تاريخ الانتهاء</span>
                  <span className="font-bold text-red-400 block mt-0.5 font-mono text-xs sm:text-sm">
                    {member.end_date || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] sm:text-[11px]">المتبقي</span>
                  <span
                    className={`font-black block mt-0.5 text-xs sm:text-sm font-mono ${
                      (member.days_left ?? 0) <= 7 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {member.is_subscribed ? `${member.days_left ?? 0} يوماً` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Alerts */}
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white mb-2">
                <Bell className="w-4 h-4 text-red-500" />
                <span>نظام تنبيهات الاشتراك الذكي</span>
              </div>

              <div className="space-y-2">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-xs transition-all ${
                        notif.urgent
                          ? 'bg-red-950/25 border-red-900/60 text-red-200'
                          : notif.type === 'renewed'
                          ? 'bg-emerald-950/25 border-emerald-900/60 text-emerald-200'
                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          {notif.urgent ? (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          ) : notif.type === 'renewed' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Flame className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm">{notif.title}</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(notif.date).toLocaleDateString('ar-LY')}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-400 pr-5">
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-800 text-xs text-neutral-400 text-center">
                    لا توجد تنبيهات عاجلة حالياً
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Section */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 p-4 bg-[#11111b] rounded-2xl border border-neutral-800">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-red-500" />
                  <span>تعديل البيانات الشخصية والهدف الرياضي</span>
                </h4>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">العمر</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">الهدف الرياضي</label>
                  <input
                    type="text"
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 min-h-[44px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs sm:text-sm cursor-pointer touch-manipulation"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3.5 sm:p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-xs sm:text-sm">
                <div>
                  <span className="text-neutral-500 block text-[11px]">الهدف الرياضي المسجل:</span>
                  <span className="font-semibold text-white">
                    {member.fitness_goal || 'تدريب عام وبناء لياقة'}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-2 min-h-[40px] rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 touch-manipulation active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
              </div>
            )}

            {editMsg && <p className="text-xs text-emerald-400 font-bold">{editMsg}</p>}

            {/* Gym Physical Location Info */}
            <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-xs text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>مقر الجيم: طريق عين زارة، طرابلس - ليبيا</span>
              </div>
              <p className="leading-relaxed">
                الاشتراك وتجديد الباقات ودفع الرسوم يتم شخصياً داخل صالة أوكسجين جيم.
              </p>
              {onNavigateToLocation && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToLocation();
                  }}
                  className="text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1.5 mt-1 cursor-pointer min-h-[38px] touch-manipulation"
                >
                  <span>عرض الخريطة وتفاصيل الموقع</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Actions - Minimum 44px touch height */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 mt-3 shrink-0">
          <button
            onClick={() => {
              clearMemberToken();
              onLogout();
              onClose();
            }}
            type="button"
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/60 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer touch-manipulation active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 min-h-[44px] rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors text-xs font-bold cursor-pointer touch-manipulation active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
