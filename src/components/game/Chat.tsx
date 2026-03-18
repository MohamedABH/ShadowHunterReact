import Message from "./Message"
import type { ChatMessage } from '../../types/chat.type';

const Chat = () => {

    const MockMessages: ChatMessage[] = [
        {
            id: 1,
            sender: 'Player1',
            content: 'Hello, everyone!',
            timestamp: '2024-06-01T12:00:00Z'
        },
        {
            id: 2,
            sender: 'Player2',
            content: 'Hi, Player1! Ready to play?',
            timestamp: '2024-06-01T12:01:00Z'
        },
        {
            id: 3,
            sender: 'Player3',
            content: 'Let\'s get started!',
            timestamp: '2024-06-01T12:02:00Z'
        }
    ]

    return (
        <div className="flex flex-col border-2">
            <div className="flex-1 overflow-y-auto p-4">
                {MockMessages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
            </div>
            <div className="p-4 border-t">
                <input type="text" placeholder="Type your message..." className="w-full border rounded px-3 py-2" />
            </div>
        </div>
    )
}

export default Chat