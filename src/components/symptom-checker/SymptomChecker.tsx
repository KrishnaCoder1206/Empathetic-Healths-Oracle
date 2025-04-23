import React, { useState, useRef, useEffect } from 'react';

// Simple ID generator function to replace uuid
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, RefreshCw, Heart } from 'lucide-react';
import { Message, MessageType, QuestionStage, Symptom } from '@/types/symptom-checker';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import FeedbackButton from './FeedbackButton';
import { useToast } from '@/hooks/use-toast';
import { 
  questionFlow, 
  bodyAreas, 
  findBodyAreaByName, 
  findSymptomByName,
  predictConditions,
  healthConditions
} from '@/data/symptom-data';

const SymptomChecker = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentStage, setCurrentStage] = useState<QuestionStage>(QuestionStage.Initial);
  const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [duration, setDuration] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'helpful' | 'unhelpful' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Initialize with first message
  useEffect(() => {
    const initialMessage: Message = {
      id: generateId(),
      type: 'bot',
      content: questionFlow[QuestionStage.Initial].question,
      timestamp: new Date(),
    };
    
    setMessages([initialMessage]);
  }, []);
  
  const sendMessage = (content: string, type: MessageType = 'user') => {
    const newMessage: Message = {
      id: generateId(),
      type,
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };
  
  const sendBotMessage = (stage: QuestionStage, options?: string[]) => {
    const flow = questionFlow[stage];
    const newMessage: Message = {
      id: generateId(),
      type: 'bot',
      content: flow.question,
      options,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentStage(stage);
    return newMessage;
  };
  
  const handleSendMessage = () => {
    if (!input.trim() && currentStage !== QuestionStage.BodyArea) return;
    
    // Handle user input based on current stage
    switch (currentStage) {
      case QuestionStage.Initial:
        sendMessage(input);
        setTimeout(() => {
          sendBotMessage(QuestionStage.BodyArea, bodyAreas.map(area => area.name));
        }, 500);
        break;
        
      case QuestionStage.BodyArea:
        // This is handled by handleOptionSelect
        break;
        
      case QuestionStage.Symptoms:
        setSymptomsText(input);
        sendMessage(input);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Details);
        }, 500);
        break;
        
      case QuestionStage.Details:
        sendMessage(input);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Duration, questionFlow[QuestionStage.Duration].options);
        }, 500);
        break;
        
      case QuestionStage.Duration:
        setDuration(input);
        sendMessage(input);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Severity, questionFlow[QuestionStage.Severity].options);
        }, 500);
        break;
        
      case QuestionStage.Severity:
        setSeverity(input);
        sendMessage(input);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Additional);
        }, 500);
        break;
        
      case QuestionStage.Additional:
        setAdditionalInfo(input);
        sendMessage(input);
        analyzeSymptoms();
        break;
        
      case QuestionStage.Results:
        // Reset and start over
        resetChat();
        break;
    }
    
    setInput('');
  };
  
  const handleOptionSelect = (option: string) => {
    switch (currentStage) {
      case QuestionStage.BodyArea:
        setSelectedBodyArea(option);
        sendMessage(option);
        const bodyArea = findBodyAreaByName(option);
        if (bodyArea) {
          const symptomOptions = bodyArea.symptoms.map(s => s.name);
          setTimeout(() => {
            const message = sendBotMessage(QuestionStage.Symptoms);
            setMessages(prev => prev.map(msg => 
              msg.id === message.id 
                ? { ...msg, options: symptomOptions } 
                : msg
            ));
          }, 500);
        }
        break;
        
      case QuestionStage.Symptoms:
        const symptom = findSymptomByName(option);
        if (symptom) {
          setSelectedSymptoms(prev => {
            const exists = prev.some(s => s.id === symptom.id);
            if (exists) return prev;
            return [...prev, symptom];
          });
          sendMessage(`I'm experiencing ${option.toLowerCase()}`);
          // If multiple symptoms selected, ask if they want to add more
          if (selectedSymptoms.length > 0) {
            setTimeout(() => {
              const otherSymptoms = bodyAreas
                .find(area => area.name === selectedBodyArea)
                ?.symptoms.filter(s => !selectedSymptoms.some(selected => selected.id === s.id))
                .map(s => s.name) || [];
              
              const message = sendBotMessage(QuestionStage.Symptoms);
              setMessages(prev => prev.map(msg => 
                msg.id === message.id 
                  ? { 
                      ...msg, 
                      content: "Would you like to add any other symptoms?",
                      options: [...otherSymptoms, "No, continue"] 
                    } 
                  : msg
              ));
            }, 500);
          }
        } else if (option === "No, continue") {
          setTimeout(() => {
            sendBotMessage(QuestionStage.Details);
          }, 500);
        }
        break;
        
      case QuestionStage.Duration:
        setDuration(option);
        sendMessage(option);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Severity, questionFlow[QuestionStage.Severity].options);
        }, 500);
        break;
        
      case QuestionStage.Severity:
        setSeverity(option);
        sendMessage(option);
        setTimeout(() => {
          sendBotMessage(QuestionStage.Additional);
        }, 500);
        break;

      case QuestionStage.Results:
        if (option === "Start Over") {
          resetChat();
        }
        break;
    }
  };
  
  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript);
      toast({
        title: "Voice recognized",
        description: `"${transcript}"`,
        duration: 3000
      });
    }
  };
  
  const handleFeedbackSubmit = (feedback: 'helpful' | 'unhelpful') => {
    setFeedbackSubmitted(feedback);
    toast({
      title: "Thank you for your feedback",
      description: feedback === 'helpful' 
        ? "We're glad our analysis was helpful for you."
        : "We appreciate your feedback and will work on improving our predictions.",
      duration: 3000
    });
    
    // Here is where you would save the feedback to a database if connected to a backend
    console.log("Feedback submitted:", {
      feedback,
      symptoms: selectedSymptoms.map(s => s.name),
      bodyArea: selectedBodyArea,
      timestamp: new Date().toISOString()
    });
  };
  
  const analyzeSymptoms = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay for more realistic experience
    setTimeout(() => {
      // Use selected symptoms for prediction
      const symptomIds = selectedSymptoms.map(s => s.id);
      const predictedConditions = predictConditions(symptomIds);
      
      // Create result message
      const resultContent = createResultsMessage(predictedConditions);
      const resultMessage: Message = {
        id: generateId(),
        type: 'results',
        content: resultContent,
        timestamp: new Date(),
        options: ["Start Over"]
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setCurrentStage(QuestionStage.Results);
      setIsAnalyzing(false);
    }, 2000);
  };
  
  const createResultsMessage = (conditions: typeof healthConditions) => {
    if (conditions.length === 0) {
      return `Based on the information you've provided, I don't have enough data to suggest specific conditions. Your symptoms could be related to many different issues.\n\n**Important**: This is not a medical diagnosis. If you're concerned about your symptoms, please consult with a healthcare professional.`;
    }
    
    let message = `Based on the information you've provided, here are some possible conditions that might explain your symptoms:\n\n`;
    
    conditions.forEach((condition, index) => {
      message += `**${index + 1}. ${condition.name}** - ${condition.description}\n`;
      message += `**Urgency**: ${condition.urgency === 'high' ? '🔴 High - Seek immediate medical attention' : 
                              condition.urgency === 'medium' ? '🟠 Medium - Consult a doctor soon' : 
                              '🟢 Low - Monitor symptoms and rest'}\n\n`;
    });
    
    message += `**IMPORTANT DISCLAIMER**: This is not a medical diagnosis. The information provided is for educational purposes only and should not replace professional medical advice. If you're concerned about your symptoms, please consult with a healthcare professional.`;
    
    return message;
  };
  
  const resetChat = () => {
    setMessages([]);
    setSelectedBodyArea(null);
    setSelectedSymptoms([]);
    setSymptomsText('');
    setDuration(null);
    setSeverity(null);
    setAdditionalInfo(null);
    setCurrentStage(QuestionStage.Initial);
    setFeedbackSubmitted(null);
    
    // Send initial message again
    setTimeout(() => {
      const initialMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: questionFlow[QuestionStage.Initial].question,
        timestamp: new Date(),
      };
      
      setMessages([initialMessage]);
    }, 300);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto h-[80vh] flex flex-col shadow-lg border-health-100 overflow-hidden">
      <CardHeader className="border-b border-health-100 bg-white">
        <div className="flex items-center">
          <Heart className="h-6 w-6 text-health-500 mr-2" />
          <div>
            <CardTitle className="text-health-700">Symptom Checker</CardTitle>
            <CardDescription>
              Discuss your symptoms and get insights about potential health conditions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 relative overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onOptionSelect={handleOptionSelect} 
              />
            ))}
            {isAnalyzing && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-pulse flex items-center text-health-600">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your symptoms...
                </div>
              </div>
            )}
            {currentStage === QuestionStage.Results && !feedbackSubmitted && (
              <div className="flex justify-center py-2 space-x-2">
                <FeedbackButton 
                  type="helpful" 
                  onSelect={() => handleFeedbackSubmit('helpful')} 
                />
                <FeedbackButton 
                  type="unhelpful" 
                  onSelect={() => handleFeedbackSubmit('unhelpful')} 
                />
              </div>
            )}
            {feedbackSubmitted && (
              <div className="text-center text-sm text-gray-500 py-2">
                Thank you for your feedback!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t border-health-100 p-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={isAnalyzing || currentStage === QuestionStage.Results}
            />
            <VoiceInput 
              onResult={handleVoiceInput} 
              isDisabled={isAnalyzing || currentStage === QuestionStage.Results} 
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isAnalyzing || (currentStage === QuestionStage.Results && input.trim() === '')}
              className="bg-health-500 hover:bg-health-600"
            >
              {currentStage === QuestionStage.Results ? (
                <RefreshCw className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {currentStage === QuestionStage.Results && (
            <div className="w-full mt-2">
              <Button 
                variant="outline" 
                className="w-full border-health-200 text-health-700 hover:bg-health-50"
                onClick={resetChat}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start a New Consultation
              </Button>
            </div>
          )}
          
          <div className="w-full mt-3 text-center text-xs text-gray-500">
            <p>This is not a medical diagnosis. Always consult a healthcare professional.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SymptomChecker;
