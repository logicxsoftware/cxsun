import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChatRealtimeClient,
  type ChatRealtimeStatus,
  addMember,
  createChannel,
  createMessage,
  forceDeleteChannel,
  forceDeleteMessage,
  listChannels,
  listChatUsers,
  listMembers,
  listMessages,
  markChannelRead,
  removeMember,
  renameChannel,
  restoreChannel,
  restoreMessage,
  suspendChannel,
  suspendMessage,
  toggleReaction,
  updateMessage
} from "./chat.services";
import type {
  ChatChannelSavePayload,
  ChatMemberSavePayload,
  ChatMessageSavePayload
} from "./chat.types";

export const chatQueryKey = ["chat"] as const;

export function useChatWorkspace(search: string, channelUuid: string | null) {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: chatQueryKey });
  return {
    channels: useQuery({
      queryKey: [...chatQueryKey, "channels", search],
      queryFn: () => listChannels(search)
    }),
    messages: useQuery({
      enabled: Boolean(channelUuid),
      queryKey: [...chatQueryKey, "messages", channelUuid],
      queryFn: () => listMessages(channelUuid ?? "")
    }),
    createChannel: useMutation({
      mutationFn: (payload: ChatChannelSavePayload) => createChannel(payload),
      onSuccess: invalidate
    }),
    renameChannel: useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) => renameChannel(id, name),
      onSuccess: invalidate
    }),
    suspendChannel: useMutation({
      mutationFn: (id: string) => suspendChannel(id),
      onSuccess: invalidate
    }),
    restoreChannel: useMutation({
      mutationFn: (id: string) => restoreChannel(id),
      onSuccess: invalidate
    }),
    forceDeleteChannel: useMutation({
      mutationFn: (id: string) => forceDeleteChannel(id),
      onSuccess: invalidate
    }),
    markRead: useMutation({
      mutationFn: (id: string) => markChannelRead(id),
      onSuccess: invalidate
    }),
    createMessage: useMutation({
      mutationFn: (payload: ChatMessageSavePayload) => createMessage(payload),
      onSuccess: invalidate
    }),
    updateMessage: useMutation({
      mutationFn: ({ body, id }: { body: string; id: string }) => updateMessage(id, body),
      onSuccess: invalidate
    }),
    suspendMessage: useMutation({
      mutationFn: (id: string) => suspendMessage(id),
      onSuccess: invalidate
    }),
    restoreMessage: useMutation({
      mutationFn: (id: string) => restoreMessage(id),
      onSuccess: invalidate
    }),
    forceDeleteMessage: useMutation({
      mutationFn: (id: string) => forceDeleteMessage(id),
      onSuccess: invalidate
    }),
    toggleReaction: useMutation({
      mutationFn: ({ emoji, id }: { emoji: string; id: string }) => toggleReaction(id, emoji),
      onSuccess: invalidate
    })
  };
}

export function useChatMembers(channelUuid: string | null) {
  const client = useQueryClient();
  const invalidate = () =>
    client.invalidateQueries({ queryKey: [...chatQueryKey, "members", channelUuid] });
  return {
    members: useQuery({
      enabled: Boolean(channelUuid),
      queryKey: [...chatQueryKey, "members", channelUuid],
      queryFn: () => listMembers(channelUuid ?? "")
    }),
    addMember: useMutation({
      mutationFn: (payload: ChatMemberSavePayload & { channelUuid: string }) =>
        addMember(payload.channelUuid, {
          role: payload.role ?? "member",
          userEmail: payload.userEmail
        }),
      onSuccess: () => {
        invalidate();
        client.invalidateQueries({ queryKey: chatQueryKey });
      }
    }),
    removeMember: useMutation({
      mutationFn: ({ channelUuid: id, memberUuid }: { channelUuid: string; memberUuid: string }) =>
        removeMember(id, memberUuid),
      onSuccess: () => {
        invalidate();
        client.invalidateQueries({ queryKey: chatQueryKey });
      }
    })
  };
}

const TYPING_CLEAR_MS = 6_000;
const HEARTBEAT_MS = 25_000;

export function useChatRealtime(channelUuid: string | null) {
  const client = useQueryClient();
  const [status, setStatus] = useState<ChatRealtimeStatus>("connecting");
  const [typingByChannel, setTypingByChannel] = useState<Record<string, string[]>>({});
  const [presenceByChannel, setPresenceByChannel] = useState<Record<string, string[]>>({});
  const realtime = useRef<ChatRealtimeClient | null>(null);
  const typingTimers = useRef(new Map<string, number>());

  useEffect(() => {
    const invalidateChat = () => client.invalidateQueries({ queryKey: chatQueryKey });
    const instance = new ChatRealtimeClient({
      onMessageChanged: () => invalidateChat(),
      onMessageCreated: () => invalidateChat(),
      onMessageDeleted: () => invalidateChat(),
      onPresence: (changedUuid, online) =>
        setPresenceByChannel((current) => ({ ...current, [changedUuid]: online })),
      onStatusChange: (next) => {
        setStatus(next);
        if (next === "open") invalidateChat();
      },
      onSyncCompleted: () => invalidateChat(),
      onTyping: (changedUuid, userEmail, typing) => {
        const key = `${changedUuid}:${userEmail.toLowerCase()}`;
        const pending = typingTimers.current.get(key);
        if (pending) window.clearTimeout(pending);
        setTypingByChannel((current) => {
          const emails = new Set(current[changedUuid] ?? []);
          if (typing) emails.add(userEmail);
          else emails.delete(userEmail);
          return { ...current, [changedUuid]: [...emails] };
        });
        if (typing) {
          typingTimers.current.set(
            key,
            window.setTimeout(() => {
              setTypingByChannel((current) => {
                const emails = new Set(current[changedUuid] ?? []);
                emails.delete(userEmail);
                return { ...current, [changedUuid]: [...emails] };
              });
              typingTimers.current.delete(key);
            }, TYPING_CLEAR_MS)
          );
        }
      }
    });
    realtime.current = instance;
    const heartbeat = window.setInterval(() => instance.ping(), HEARTBEAT_MS);
    return () => {
      window.clearInterval(heartbeat);
      for (const timer of typingTimers.current.values()) window.clearTimeout(timer);
      typingTimers.current.clear();
      instance.close();
      realtime.current = null;
    };
  }, [client]);

  useEffect(() => {
    if (channelUuid) realtime.current?.subscribe(channelUuid);
    return () => {
      if (channelUuid) realtime.current?.unsubscribe(channelUuid);
    };
  }, [channelUuid, status]);

  return {
    client: realtime,
    onlineEmails: channelUuid ? (presenceByChannel[channelUuid] ?? []) : [],
    status,
    typingEmails: channelUuid ? (typingByChannel[channelUuid] ?? []) : []
  };
}

export function useChatUsers(search = "") {
  return useQuery({
    queryKey: [...chatQueryKey, "users", search],
    queryFn: () => listChatUsers(search)
  });
}
