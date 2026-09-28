import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PlusIcon,
  BookOpenIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  Trash2Icon,
  CrownIcon,
  XIcon,
  CheckIcon,
  CalendarIcon,
  PencilIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useStore } from '@/src/lib/store';
import { Card, SectionTitle } from '@/components/ui';
import { COURSE_COLORS, type CourseColor } from '@/src/lib/gamification';

cssInterop(PlusIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BookOpenIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PlusCircleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(MinusCircleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Trash2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CrownIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(XIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CalendarIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PencilIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

const COLOR_OPTIONS: CourseColor[] = ['purple', 'blue', 'green', 'pink', 'orange', 'teal'];
const FREE_LIMIT = 3;
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;

type AssignmentPriority = (typeof PRIORITY_OPTIONS)[number];

export default function Courses() {
  const {
    state,
    addCourse,
    removeCourse,
    updateCourseAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentComplete,
  } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<CourseColor>('purple');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState('');
  const [detailsCourseId, setDetailsCourseId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDueDate, setDraftDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [draftPriority, setDraftPriority] = useState<AssignmentPriority>('Medium');
  const [draftNotes, setDraftNotes] = useState('');
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState('');

  const selectedCourse = useMemo(
    () => state.courses.find((course) => course.id === detailsCourseId) ?? null,
    [detailsCourseId, state.courses],
  );

  const selectedAssignments = useMemo(
    () =>
      selectedCourse
        ? state.assignments.filter((assignment) => assignment.courseId === selectedCourse.id)
        : [],
    [selectedCourse, state.assignments],
  );

  const isPremium = state.settings.premium;
  const atLimit = !isPremium && state.courses.length >= FREE_LIMIT;

  const openAdd = () => {
    setError('');
    setName('');
    setColor('purple');
    if (atLimit) {
      setShowUpgrade(true);
    } else {
      setModalOpen(true);
    }
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Please enter a course name.');
      return;
    }
    const ok = addCourse(name.trim(), color);
    if (ok) {
      setModalOpen(false);
      setName('');
    } else {
      setError('You reached the free plan limit of 3 courses.');
    }
  };

  const resetAssignmentDraft = () => {
    setEditingAssignmentId(null);
    setDraftTitle('');
    setDraftNotes('');
    setDraftPriority('Medium');
    setDraftDueDate(new Date().toISOString().slice(0, 10));
    setAssignmentError('');
  };

  const submitAssignment = () => {
    if (!selectedCourse) return;
    if (!draftTitle.trim()) {
      setAssignmentError('Please enter an assignment title.');
      return;
    }

    if (editingAssignmentId) {
      updateAssignment(editingAssignmentId, {
        title: draftTitle.trim(),
        dueDate: draftDueDate,
        priority: draftPriority,
        notes: draftNotes.trim(),
      });
    } else {
      addAssignment(selectedCourse.id, draftTitle.trim(), draftDueDate, draftPriority, draftNotes.trim());
    }

    resetAssignmentDraft();
  };

  const openAssignmentEditor = (assignment?: (typeof selectedAssignments)[number]) => {
    if (!selectedCourse) return;
    if (assignment) {
      setEditingAssignmentId(assignment.id);
      setDraftTitle(assignment.title);
      setDraftDueDate(assignment.dueDate);
      setDraftPriority(assignment.priority);
      setDraftNotes(assignment.notes);
    } else {
      resetAssignmentDraft();
    }
    setAssignmentError('');
  };

  const dueSoonLabel = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    if (diff <= 7) return `Due in ${diff}d`;
    return 'Upcoming';
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between pt-4 pb-2">
          <View>
            <Text className="text-2xl font-bold text-foreground">Courses</Text>
            <Text className="text-sm text-muted-foreground">
              {state.courses.length}
              {isPremium ? '' : ` / ${FREE_LIMIT}`} courses
            </Text>
          </View>
          <Pressable
            onPress={openAdd}
            className="w-12 h-12 rounded-full items-center justify-center bg-primary active:scale-[0.95]"
          >
            <PlusIcon size={24} color="#fff" />
          </Pressable>
        </View>

        {!isPremium && (
          <Pressable
            onPress={() => setShowUpgrade(true)}
            className="mb-4 bg-primary/10 rounded-xl px-4 py-3 flex-row items-center gap-2 active:scale-[0.98]"
          >
            <CrownIcon size={18} className="text-primary" />
            <Text className="text-sm text-foreground flex-1">
              Unlock unlimited courses with Premium
            </Text>
            <Text className="text-xs font-semibold text-primary">Upgrade</Text>
          </Pressable>
        )}

        <SectionTitle>My Courses</SectionTitle>

        {state.courses.length === 0 ? (
          <Card>
            <View className="items-center py-6 gap-2">
              <BookOpenIcon size={40} className="text-muted-foreground" />
              <Text className="text-muted-foreground text-center">
                No courses yet. Add your first course to start tracking assignments.
              </Text>
            </View>
          </Card>
        ) : (
          <View className="gap-3">
            {state.courses.map((course) => {
              const palette = COURSE_COLORS[course.color] ?? COURSE_COLORS.purple;
              return (
                <Pressable key={course.id} onPress={() => setDetailsCourseId(course.id)}>
                  <Card className="flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: palette.soft, width: 48, height: 48, borderRadius: 14 }}
                      className="items-center justify-center"
                    >
                      <BookOpenIcon size={22} color={palette.base} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{course.name}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {course.assignments} assignment{course.assignments === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={() => updateCourseAssignments(course.id, -1)}
                        className="active:scale-[0.9]"
                      >
                        <MinusCircleIcon size={26} className="text-muted-foreground" />
                      </Pressable>
                      <Text className="text-base font-semibold text-foreground w-6 text-center">
                        {course.assignments}
                      </Text>
                      <Pressable
                        onPress={() => updateCourseAssignments(course.id, 1)}
                        className="active:scale-[0.9]"
                      >
                        <PlusCircleIcon size={26} className="text-primary" />
                      </Pressable>
                      <Pressable
                        onPress={() => removeCourse(course.id)}
                        className="ml-2 active:scale-[0.9]"
                      >
                        <Trash2Icon size={20} className="text-destructive" />
                      </Pressable>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add course modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setModalOpen(false)}
          />
          <View className="bg-card rounded-t-3xl px-5 pt-6 pb-10">
            <View className="w-10 h-1 rounded-full bg-muted self-center mb-6" />
            <Text className="text-xl font-bold text-foreground mb-4">New Course</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Course name (e.g. Chemistry)"
              placeholderTextColor="#9A9AB0"
              className="bg-background border border-border rounded-xl px-4 py-3.5 text-foreground mb-4"
            />

            <Text className="text-sm text-muted-foreground mb-2">Color</Text>
            <View className="flex-row gap-3 mb-4">
              {COLOR_OPTIONS.map((c) => {
                const palette = COURSE_COLORS[c];
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: palette.base,
                      borderWidth: color === c ? 3 : 0,
                      borderColor: '#fff',
                    }}
                    className="active:scale-[0.9]"
                  />
                );
              })}
            </View>

            {error ? (
              <Text className="text-destructive text-xs mb-3">{error}</Text>
            ) : null}

            <Pressable onPress={submit} className="active:scale-[0.97]">
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, padding: 16 }}
                className="items-center"
              >
                <Text className="text-white font-bold">Add Course</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Course details modal */}
      <Modal visible={!!selectedCourse} transparent animationType="slide" onRequestClose={() => setDetailsCourseId(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
            onPress={() => setDetailsCourseId(null)}
          />
          <ScrollView
            className="bg-card rounded-t-3xl px-5 pt-6 max-h-[85%]"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {selectedCourse && (
              <>
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        backgroundColor: COURSE_COLORS[selectedCourse.color]?.soft ?? 'rgba(139,92,246,0.16)',
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                      }}
                      className="items-center justify-center"
                    >
                      <BookOpenIcon size={20} color={COURSE_COLORS[selectedCourse.color]?.base ?? '#8B5CF6'} />
                    </View>
                    <View>
                      <Text className="text-xl font-bold text-foreground">{selectedCourse.name}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {selectedCourse.assignments} total assignments
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setDetailsCourseId(null)}>
                    <XIcon size={22} className="text-muted-foreground" />
                  </Pressable>
                </View>

                <View className="mb-5">
                  <Text className="text-sm text-muted-foreground mb-2">Course progress</Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-lg font-bold text-foreground">
                      {selectedAssignments.filter((assignment) => assignment.completed).length}/
                      {selectedAssignments.length || 1} complete
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {selectedAssignments.length === 0
                        ? '0%'
                        : `${Math.round(
                            (selectedAssignments.filter((assignment) => assignment.completed).length /
                              selectedAssignments.length) *
                              100,
                          )}%`}
                    </Text>
                  </View>
                  <View className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <View
                      style={{
                        width: `${
                          selectedAssignments.length === 0
                            ? 0
                            : (selectedAssignments.filter((assignment) => assignment.completed).length /
                                selectedAssignments.length) * 100
                        }%`,
                        height: '100%',
                        borderRadius: 999,
                        backgroundColor: COURSE_COLORS[selectedCourse.color]?.base ?? '#8B5CF6',
                      }}
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold text-foreground">Assignments</Text>
                    <Pressable onPress={() => openAssignmentEditor()}>
                      <Text className="text-xs text-primary">Clear form</Text>
                    </Pressable>
                  </View>
                  {selectedAssignments.length === 0 ? (
                    <Card>
                      <Text className="text-sm text-muted-foreground text-center py-3">
                        No assignments yet.
                      </Text>
                    </Card>
                  ) : (
                    <View className="gap-3">
                      {selectedAssignments.map((assignment) => (
                        <Card key={assignment.id} className="gap-2">
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                              <Text className="font-semibold text-foreground">{assignment.title}</Text>
                              <Text className="text-xs text-muted-foreground mt-1">
                                {assignment.priority} · {dueSoonLabel(assignment.dueDate)}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => toggleAssignmentComplete(assignment.id)}
                              className="active:scale-[0.94]"
                            >
                              <View
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: assignment.completed ? '#10B981' : 'rgba(255,255,255,0.06)',
                                  borderWidth: assignment.completed ? 0 : 1,
                                  borderColor: '#6b7280',
                                }}
                                className="items-center justify-center"
                              >
                                {assignment.completed ? <CheckIcon size={16} color="#fff" /> : null}
                              </View>
                            </Pressable>
                          </View>

                          {assignment.notes ? (
                            <Text className="text-xs text-muted-foreground">{assignment.notes}</Text>
                          ) : null}

                          <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-xs text-muted-foreground">
                              {assignment.dueDate}
                            </Text>
                            <View className="flex-row items-center gap-3">
                              <Pressable onPress={() => openAssignmentEditor(assignment)}>
                                <PencilIcon size={16} className="text-primary" />
                              </Pressable>
                              <Pressable onPress={() => deleteAssignment(assignment.id)}>
                                <Trash2Icon size={16} className="text-destructive" />
                              </Pressable>
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-muted-foreground mb-2">New assignment</Text>
                  <TextInput
                    value={draftTitle}
                    onChangeText={setDraftTitle}
                    placeholder="Assignment title"
                    placeholderTextColor="#9A9AB0"
                    className="bg-background border border-border rounded-xl px-4 py-3.5 text-foreground mb-3"
                  />
                  <View className="mb-3 gap-3">
                    <TextInput
                      value={draftDueDate}
                      onChangeText={setDraftDueDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9A9AB0"
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-3.5 text-foreground"
                    />
                    <View className="w-full bg-background border border-border rounded-xl px-3 py-2.5">
                      <Text className="text-xs text-muted-foreground mb-1">Priority</Text>
                      <View className="flex-row gap-2">
                        {PRIORITY_OPTIONS.map((priority) => (
                          <Pressable
                            key={priority}
                            onPress={() => setDraftPriority(priority)}
                            className="flex-1 items-center px-1 py-1 rounded-full"
                            style={{
                              backgroundColor:
                                draftPriority === priority ? 'rgba(139,92,246,0.2)' : 'transparent',
                            }}
                          >
                            <Text
                              className={draftPriority === priority ? 'text-primary font-medium' : 'text-muted-foreground'}
                              style={{ fontSize: 11 }}
                            >
                              {priority}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                  <TextInput
                    value={draftNotes}
                    onChangeText={setDraftNotes}
                    placeholder="Notes"
                    placeholderTextColor="#9A9AB0"
                    multiline
                    className="bg-background border border-border rounded-xl px-4 py-3.5 text-foreground min-h-[72px] mb-3"
                  />
                  {assignmentError ? (
                    <Text className="text-destructive text-xs mb-3">{assignmentError}</Text>
                  ) : null}
                  <Pressable onPress={submitAssignment} className="active:scale-[0.97]">
                    <LinearGradient
                      colors={['#8B5CF6', '#3B82F6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 14, padding: 14 }}
                      className="items-center"
                    >
                      <Text className="text-white font-bold">
                        {editingAssignmentId ? 'Save Assignment' : 'Add Assignment'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Upgrade modal */}
      <Modal visible={showUpgrade} transparent animationType="slide" onRequestClose={() => setShowUpgrade(false)}>
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-card rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <CrownIcon size={28} className="text-primary" />
              <Pressable onPress={() => setShowUpgrade(false)}>
                <XIcon size={24} className="text-muted-foreground" />
              </Pressable>
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">Go Premium</Text>
            <Text className="text-muted-foreground mb-5">
              You've hit the free plan limit of {FREE_LIMIT} courses. Upgrade to add unlimited
              courses plus custom intervals, analytics, and themes.
            </Text>
            {['Unlimited courses', 'Custom focus intervals', 'Advanced analytics', 'Premium themes', 'Goal forecasting'].map(
              (perk) => (
                <View key={perk} className="flex-row items-center gap-2 mb-2">
                  <CrownIcon size={14} className="text-primary" />
                  <Text className="text-sm text-foreground">{perk}</Text>
                </View>
              ),
            )}
            <Pressable
              onPress={() => setShowUpgrade(false)}
              className="mt-6 active:scale-[0.97]"
            >
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, padding: 16 }}
                className="items-center"
              >
                <Text className="text-white font-bold">See Pricing</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setShowUpgrade(false)} className="mt-3">
              <Text className="text-center text-muted-foreground">Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
