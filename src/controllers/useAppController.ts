import { useMemo } from 'react';
import { createTaskId, createToastPayload, useAppDispatch, useAppState } from '../models/store';
import type { CancelTaskInput, ChatMessage, ClockPreset, CreateTaskInput, ScreenKey, ScreenMode, Task } from '../models/types';

function isNearShiftEnd(now: number): boolean {
  const date = new Date(now);
  const hour = date.getHours();
  return hour >= 15;
}

export function useAppController() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const pushToast = (tone: 'success' | 'info' | 'warn' | 'error', title: string, message?: string) => {
    dispatch({ type: 'pushToast', toast: createToastPayload(tone, title, message) });
  };

  const ensureOnline = (): boolean => {
    if (state.offline) {
      pushToast('warn', 'Du er offline', 'Du kan se opgaver, men ikke opdatere lige nu.');
      return false;
    }
    return true;
  };

  const findTask = (taskId: string): Task | undefined => state.tasks.find((task) => task.id === taskId);

  return useMemo(
    () => ({
      state,
      setOffline(offline: boolean) {
        dispatch({ type: 'setOffline', offline });
      },
      setClockPreset(preset: ClockPreset) {
        dispatch({ type: 'setClockPreset', preset });
      },
      setScreenMode(key: ScreenKey, mode: ScreenMode) {
        dispatch({ type: 'setScreenMode', key, mode });
      },
      retryScreen(key: ScreenKey) {
        dispatch({ type: 'setScreenMode', key, mode: 'normal' });
      },
      dismissToast(toastId: string) {
        dispatch({ type: 'dismissToast', toastId });
      },
      takeTask(taskId: string) {
        if (!ensureOnline()) return;
        dispatch({ type: 'takeTask', taskId });
        pushToast('success', 'Opgave taget', 'Opgaven er nu tildelt dig.');
      },
      startTask(taskId: string) {
        if (!ensureOnline()) return;
        dispatch({ type: 'startTask', taskId });
        pushToast('info', 'Opgave startet', 'Status er ændret til I gang.');
      },
      completeTask(taskId: string) {
        const task = findTask(taskId);
        if (!task) return;
        if (task.priority !== 'akut' && task.requiresExtraCheck && !task.extraCheckCompleted) {
          pushToast('warn', 'Ekstra tjek mangler', 'Afslut ekstra tjek før du markerer opgaven som færdig.');
          return;
        }
        if (!ensureOnline()) return;
        dispatch({ type: 'completeTask', taskId });
        pushToast('success', 'Opgave færdig', 'Patienten er opdateret i flowet.');
      },
      toggleExtraCheckItem(taskId: string, itemId: string) {
        if (!ensureOnline()) return;
        dispatch({ type: 'toggleExtraCheckItem', taskId, itemId });
      },
      requestHelp(source: 'dashboard' | 'detail', taskId?: string) {
        if (!ensureOnline()) return;
        dispatch({ type: 'requestHelp', source, taskId });
        pushToast('info', 'Hjælp anmodet', 'Planlægger kan nu se dit behov for hjælp.');
      },
      cancelTask(input: CancelTaskInput) {
        if (!ensureOnline()) return;
        dispatch({ type: 'cancelTask', input });
        pushToast('warn', 'Opgave afmeldt', 'Opgaven er sendt tilbage og kan påvirke patientventetid.');
      },
      assignTask(taskId: string, teamId?: string, employeeId?: string, auto?: boolean) {
        if (!ensureOnline()) return;
        dispatch({ type: 'assignTask', taskId, teamId, employeeId, auto });
      },
      toggleTaskLock(taskId: string) {
        if (!ensureOnline()) return;
        dispatch({ type: 'toggleTaskLock', taskId });
        const task = findTask(taskId);
        pushToast(
          'info',
          task?.lockedToTeam ? 'Team-lås fjernet' : 'Opgave låst til team',
          'Afmelding bliver nu håndteret i team-køen.',
        );
      },
      sendChat(taskId: string, text: string, senderRole: ChatMessage['senderRole'], senderName: string, isTemplate?: boolean) {
        if (!ensureOnline()) return;
        dispatch({ type: 'sendChat', taskId, text, senderRole, senderName, isTemplate });
      },
      createTask(input: CreateTaskInput) {
        if (!ensureOnline()) return null;
        const taskId = createTaskId();
        dispatch({ type: 'createTask', taskId, input });
        pushToast('success', 'Opgave sendt', 'Planlægger og team kan nu se opgaven.');
        return taskId;
      },
      pushInfo(title: string, message?: string) {
        pushToast('info', title, message);
      },
      isNearShiftEnd: isNearShiftEnd(state.now),
    }),
    [dispatch, state],
  );
}
