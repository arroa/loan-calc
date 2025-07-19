
import React from 'react';
import { 
  Calculator, 
  Loader2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  MoreHorizontal, 
  Calendar, 
  ChevronRight, 
  RotateCcw,
  Printer,
  Mail
} from 'lucide-react';

export type IconName = 'calculator' | 'loader' | 'error' | 'warning' | 'info' | 'dots' | 'calendar' | 'skip' | 'reset' | 'printer' | 'mail';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const ICONS: Record<IconName, React.ReactNode> = {
  calculator: <Calculator />,
  loader: <Loader2 />,
  error: <AlertCircle />,
  warning: <AlertTriangle />,
  info: <Info />,
  dots: <MoreHorizontal />,
  calendar: <Calendar />,
  skip: <ChevronRight />,
  reset: <RotateCcw />,
  printer: <Printer />,
  mail: <Mail />
};

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const IconComponent = ICONS[name];
  
  return React.cloneElement(IconComponent as React.ReactElement, {
    className,
    size: 24,
    ...props
  } as any);
};
