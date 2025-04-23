
import React from 'react';
import { cn } from '@/lib/utils';
import { Message, MessageType } from '@/types/symptom-checker';
import { Heart, AlertCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
}

const MessageIcon = ({ type }: { type: MessageType }) => {
  switch (type) {
    case 'bot':
      return <Heart className="h-5 w-5 text-health-500" />;
    case 'results':
      return <AlertCircle className="h-5 w-5 text-health-600" />;
    default:
      return <HelpCircle className="h-5 w-5 text-gray-500" />;
  }
};

const ChatMessage = ({ message, onOptionSelect }: ChatMessageProps) => {
  const isBot = message.type === 'bot' || message.type === 'results';

  // Function to render message content with markdown-like formatting
  const renderFormattedContent = (content: string) => {
    // Split content by new lines
    const lines = content.split('\n');
    
    return (
      <>
        {lines.map((line, i) => {
          // Bold text (between ** **)
          const boldPattern = /\*\*(.*?)\*\*/g;
          const parts = [];
          let lastIndex = 0;
          let match;
          
          // Process bold patterns
          while ((match = boldPattern.exec(line)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
              parts.push(line.substring(lastIndex, match.index));
            }
            
            // Add bold text
            parts.push(<strong key={`bold-${i}-${match.index}`}>{match[1]}</strong>);
            
            lastIndex = match.index + match[0].length;
          }
          
          // Add remaining text
          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }
          
          // If parts array is empty, just return the line
          const content = parts.length > 0 ? parts : line;
          
          // Add line breaks between paragraphs
          return (
            <React.Fragment key={`line-${i}`}>
              {content}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </>
    );
  };
  
  // Custom rendering for urgency badges
  const renderWithUrgencyBadges = (content: string) => {
    // Replace 🔴 High with a badge
    content = content.replace(/🔴 High/g, '<urgency-high>High</urgency-high>');
    content = content.replace(/🟠 Medium/g, '<urgency-medium>Medium</urgency-medium>');
    content = content.replace(/🟢 Low/g, '<urgency-low>Low</urgency-low>');
    
    const parts = content.split(/<urgency-(.*?)>(.*?)<\/urgency-.*?>/g).filter(Boolean);
    
    return parts.map((part, index) => {
      if (part === 'high') {
        return <Badge key={`badge-high-${index}`} variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">High</Badge>;
      } else if (part === 'medium') {
        return <Badge key={`badge-medium-${index}`} variant="outline" className="ml-2 bg-orange-50 text-orange-600 border-orange-200">Medium</Badge>;
      } else if (part === 'low') {
        return <Badge key={`badge-low-${index}`} variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">Low</Badge>;
      }
      return <span key={`text-${index}`}>{renderFormattedContent(part)}</span>;
    });
  };
  
  return (
    <div className={cn(
      'flex w-full mb-4',
      isBot ? 'justify-start' : 'justify-end'
    )}>
      <div className={cn(
        'flex max-w-[80%] w-fit rounded-lg p-4 overflow-hidden',
        isBot ? 'bg-white border border-gray-200 shadow-sm' : 'bg-health-500 text-white'
      )}>
        {isBot && (
          <div className="mr-3 flex-shrink-0 pt-1">
            <MessageIcon type={message.type} />
          </div>
        )}
        
        <div className="flex flex-col w-full overflow-hidden">
          <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
            {message.content.includes('**Urgency**:') 
              ? renderWithUrgencyBadges(message.content)
              : renderFormattedContent(message.content)
            }
          </div>
          
          {message.options && message.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 max-w-full">
              {message.options.map((option, index) => (
                <button
                  key={`option-${index}`}
                  onClick={() => onOptionSelect && onOptionSelect(option)}
                  className="bg-white text-health-700 hover:bg-health-50 border border-health-200 rounded-full px-3 py-1 text-sm transition-colors max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ maxWidth: 'calc(100% - 8px)' }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
