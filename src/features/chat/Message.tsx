import type { ChatMessage } from '../../types/chat.type';

type MessageProps = {
    message: ChatMessage;
};

const Message = ({ message }: MessageProps) => {
    return (
        <div key={message.id} className="mb-2">
            <strong>{message.sender}</strong>: {message.content}
            <div className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</div>
        </div>
    )
}

export default Message
