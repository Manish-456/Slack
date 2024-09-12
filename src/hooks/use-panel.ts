import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from '../features/members/store/use-profile-member-id';

export const usePanel = () => {
    const [ parentMessageId, setParentMessageId ] = useParentMessageId()
    const [ profileMemberId, setProfileMemberId ] = useProfileMemberId()
    const onOpenMessage = (messageId: string) => {
        setProfileMemberId(null);
        setParentMessageId(messageId)
    };
    const onOpenProfile = (memberId: string) => {
        setParentMessageId(null);
        setProfileMemberId(memberId)
    };

    const onClose = () => {
        setParentMessageId(null);
         setProfileMemberId(null);
    }

    return {
        profileMemberId,
        onOpenProfile,
        parentMessageId,
        onOpenMessage,
        onClose
    }
}