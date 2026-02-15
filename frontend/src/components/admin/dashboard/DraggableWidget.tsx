
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';


interface DraggableWidgetProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    dragHandleClassName?: string;
    onResize?: () => void;
    isExpanded?: boolean;
}

export const DraggableWidget = ({ id, children, className, dragHandleClassName, onResize, isExpanded }: DraggableWidgetProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("relative h-full transition-all duration-300", className)}>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
                {onResize && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            onResize();
                        }}
                        className="p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                        title={isExpanded ? "Reducir" : "Expandir"}
                    >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                )}
                <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                        "cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground p-1 rounded-md transition-colors",
                        dragHandleClassName
                    )}
                >
                    <GripVertical className="h-4 w-4" />
                </div>
            </div>
            {children}
        </div>
    );
};
