"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Button } from './button';

// Drag Handle Component
export const DragHandle = () => {
  return (
    <div className="flex items-center justify-center px-1">
      <GripVertical className="h-4 w-4 text-gray-400" />
    </div>
  );
};

// Sortable Item Component
export const SortableItem = React.memo(({ id, item, onDelete, renderItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 mb-2 bg-white rounded-md border ${isDragging ? 'border-primary shadow-md' : 'border-gray-200'}`}
    >
      <div className="flex items-center flex-1">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
        <div className="flex-1">
          {renderItem ? renderItem(item) : (
            <div className="flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-gray-500 text-sm">{item.link}</span>
            </div>
          )}
        </div>
      </div>
      {onDelete && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(id)}
          className="ml-2"
        >
          Sil
        </Button>
      )}
    </div>
  );
});

SortableItem.displayName = 'SortableItem';

// Sortable Item Component that doesn't rely on useSortable (for the overlay)
export const Item = React.memo(({ item, renderItem }) => {
  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-white rounded-md border border-primary shadow-md">
      <div className="flex items-center flex-1">
        <DragHandle />
        <div className="flex-1">
          {renderItem ? renderItem(item) : (
            <div className="flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-gray-500 text-sm">{item.link}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Item.displayName = 'Item';

// Main Sortable List Component
export const SortableList = ({ items, onChange, onDelete, renderItem, idField = '_id' }) => {
  const [activeId, setActiveId] = useState(null);
  
  // Önceki öğeleri tutmak için ref kullanıyoruz
  const itemsRef = useRef(items);
  
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  
  // Get the active item for the drag overlay
  const activeItem = activeId ? items.find(item => item[idField] === activeId) : null;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distance in pixels required to activate
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);
  
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentItems = [...itemsRef.current];
      const oldIndex = currentItems.findIndex(item => item[idField] === active.id);
      const newIndex = currentItems.findIndex(item => item[idField] === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      // Move the item in the array
      const newItems = arrayMove(currentItems, oldIndex, newIndex);
      
      // Update order values
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index
      }));
      
      // Call the change handler with the new array and updated order indices
      onChange(updatedItems);
    }
    
    setActiveId(null);
  }, [onChange, idField]);
  
  // Stabil kalacak şekilde item ID'lerini memo'luyoruz
  const itemIds = React.useMemo(() => 
    items.map(item => item[idField]), 
    [items, idField]
  );
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {items.map(item => (
            <SortableItem
              key={item[idField]}
              id={item[idField]}
              item={item}
              onDelete={onDelete}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
      
      {typeof window !== 'undefined' && createPortal(
        <DragOverlay adjustScale={false}>
          {activeId ? <Item item={activeItem} renderItem={renderItem} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}; 