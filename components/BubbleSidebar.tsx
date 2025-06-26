
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type Align = 'left' | 'right' | 'top' | 'bottom';

const BubbleSidebarContext = createContext<{
  align: Align;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
}>({
  align: 'left',
  selectedKey: null,
  setSelectedKey: () => {},
});

export const BubbleSidebar = ({
  align = 'left',
  children,
}: {
  align?: Align;
  children: React.ReactNode;
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSelectedKey(null);
      }
    };

    if (selectedKey) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedKey]);

  const isHorizontal = align === 'left' || align === 'right';
  const flexDirection = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    top: 'flex-col',
    bottom: 'flex-col-reverse'
  }[align];

  return (
    <BubbleSidebarContext.Provider value={{ align, selectedKey, setSelectedKey }}>
      <div className={`flex h-full ${flexDirection}`}>
        <motion.div 
          ref={sidebarRef}
          className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-4 items-center p-4 relative`}
          initial={{ 
            opacity: 0, 
            x: isHorizontal ? (align === 'left' ? -20 : 20) : 0,
            y: !isHorizontal ? (align === 'top' ? -20 : 20) : 0
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </BubbleSidebarContext.Provider>
  );
};

// Hook para uso interno
const useBubbleSidebar = () => useContext(BubbleSidebarContext);

// Interface for components that receive isSelected prop
interface BubbleChildProps {
  isSelected?: boolean;
  children: React.ReactNode;
  bubbleRef?: React.RefObject<HTMLDivElement>;
}

// Componente principal Bubble
export const Bubble = ({
  children,
  bubbleKey,
  variant = 'default',
  size = 'medium',
}: {
  children: React.ReactNode;
  bubbleKey: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'glass';
  size?: 'small' | 'medium' | 'large';
}) => {
  const { selectedKey, setSelectedKey } = useBubbleSidebar();
  const isSelected = selectedKey === bubbleKey;
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setSelectedKey(isSelected ? null : bubbleKey);
  };

  return (
    <motion.div
      ref={bubbleRef}
      className="flex flex-col items-center group relative"
      onClick={handleClick}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        // Pass props to child components
        return cloneElement(child as React.ReactElement<any>, { 
          isSelected,
          bubbleRef,
          variant,
          size
        });
      })}
    </motion.div>
  );
};

Bubble.Icon = ({
  children,
  isSelected,
  variant = 'default',
  size = 'medium',
}: BubbleChildProps & {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | "glass";
  size?: 'small' | 'medium' | 'large';
}) => {
  const { align } = useBubbleSidebar();

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    secondary: 'bg-gray-50 border-gray-300',
    accent: 'bg-purple-50 border-purple-200',
    glass: "bg-white/60 backdrop-blur-3xl border border-white/70",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center shadow-md cursor-pointer transition relative border ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.1 : 1,
        boxShadow: isSelected 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

Bubble.Content = ({
  children,
  isSelected,
  bubbleRef,
  width = 'auto',
  variant = 'default',
}: BubbleChildProps & {
  width?: 'auto' | 'small' | 'medium' | 'large' | 'full';
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'glass';
}) => {
  const { align } = useBubbleSidebar();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const widthClasses = {
    auto: 'w-auto',
    small: 'w-48',
    medium: 'w-64',
    large: 'w-80',
    full: 'w-full'
  };

  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    secondary: 'bg-gray-50 border-gray-300',
    accent: 'bg-purple-50 border-purple-200',
    glass: 'bg-white/60 backdrop-blur-3xl border-white/70',
  };

  useEffect(() => {
    if (isSelected && bubbleRef?.current && contentRef.current) {
      const bubbleRect = bubbleRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const sidebar = bubbleRef.current.closest('[class*="flex"]');
      const sidebarRect = sidebar?.getBoundingClientRect();

      if (!sidebarRect) return;

      let newX = 0;
      let newY = 0;

      if (align === 'left' || align === 'right') {
        // Posicionamiento horizontal
        const baseOffset = align === 'left' ? 60 : -60;
        newX = baseOffset;
        
        // Calcular posición vertical centrada
        const bubbleCenterY = bubbleRect.top + bubbleRect.height / 2;
        const sidebarTop = sidebarRect.top;
        const sidebarBottom = sidebarRect.bottom;
        
        // Intentar centrar el contenido respecto al bubble
        let targetY = -(contentRect.height / 2);
        
        // Verificar límites y ajustar
        const contentTop = bubbleCenterY + targetY;
        const contentBottom = contentTop + contentRect.height;
        
        if (contentTop < sidebarTop + 16) {
          targetY = sidebarTop - bubbleCenterY + 16;
        } else if (contentBottom > sidebarBottom - 16) {
          targetY = sidebarBottom - bubbleCenterY - contentRect.height - 16;
        }
        
        newY = targetY;
      } else {
        // Posicionamiento vertical
        if (align === 'top') {
          newY = 60; // Contenido debajo del bubble
        } else { // bottom
          newY = -(contentRect.height + 16); // Contenido arriba del bubble
        }
        
        // Calcular posición horizontal centrada
        const bubbleCenterX = bubbleRect.left + bubbleRect.width / 2;
        const sidebarLeft = sidebarRect.left;
        const sidebarRight = sidebarRect.right;
        
        // Intentar centrar el contenido respecto al bubble
        let targetX = -(contentRect.width / 2);
        
        // Verificar límites y ajustar
        const contentLeft = bubbleCenterX + targetX;
        const contentRight = contentLeft + contentRect.width;
        
        if (contentLeft < sidebarLeft + 16) {
          targetX = sidebarLeft - bubbleCenterX + 16;
        } else if (contentRight > sidebarRight - 16) {
          targetX = sidebarRight - bubbleCenterX - contentRect.width - 16;
        }
        
        newX = targetX;
      }

      setPosition({ x: newX, y: newY });
    }
  }, [isSelected, align, bubbleRef]);

  return (
    <AnimatePresence>
      {isSelected && (
        <motion.div
          ref={contentRef}
          className={`absolute ${widthClasses[width]} flex flex-col gap-2 p-4 rounded-lg shadow-xl z-20 border backdrop-blur-sm ${variantClasses[variant]}`}
          style={{
            left: position.x,
            top: position.y,
          }}
          onClick={(e) => e.stopPropagation()}
          initial={{ 
            opacity: 0, 
            scale: 0.95,
            x: align === 'left' ? -10 : align === 'right' ? 10 : 0,
            y: align === 'top' ? -10 : align === 'bottom' ? 10 : 0
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: 0,
            y: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            x: align === 'left' ? -10 : align === 'right' ? 10 : 0,
            y: align === 'top' ? -10 : align === 'bottom' ? 10 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            duration: 0.2 
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Sub-componentes adicionales
Bubble.Header = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="font-semibold text-gray-900 mb-2 pb-2 border-b "
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

Bubble.Body = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="text-gray-600 text-sm space-y-2"
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

Bubble.Footer = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="mt-3 pt-3 border-t  flex gap-2"
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

Bubble.Item = ({ 
  children, 
  onClick, 
  icon: Icon,
  hover = true,
  padding = true,
  closeOnClick = false,
  variant = 'default'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  icon?: React.ComponentType<any>;
  hover?: boolean;
  padding?: boolean;
  closeOnClick?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'glass';
}) => {
  const { setSelectedKey } = useBubbleSidebar();

  const variantHoverClasses = {
    default: 'hover:bg-gray-50',
    primary: 'hover:bg-blue-50',
    secondary: 'hover:bg-gray-100',
    accent: 'hover:bg-purple-50',
    glass: 'hover:bg-gray-200 hover:backdrop-blur-sm',
  };

  const variantTextClasses = {
    default: 'text-gray-700',
    primary: 'text-blue-700',
    secondary: 'text-gray-700',
    accent: 'text-purple-700',
    glass: 'text-gray-800',
  };

  const variantIconClasses = {
    default: 'text-gray-500',
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    accent: 'text-purple-500',
    glass: 'text-gray-600',
  };

  return (
    <div 
      className={`flex items-center ${padding ? 'gap-2 p-2' : ''} ${hover ? `${variantHoverClasses[variant]} cursor-pointer` : ''} rounded transition-colors`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        if (closeOnClick) {
          setSelectedKey(null);
        }
      }}
    >
      {Icon && <Icon size={16} className={variantIconClasses[variant]} />}
      <span className={`text-sm ${variantTextClasses[variant]}`}>{children}</span>
    </div>
  );
};
