import React, { useState } from "react";

interface AnimatedListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, isFocused: boolean) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function AnimatedList<T>({ items, keyExtractor, renderItem, emptyState }: AnimatedListProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(items.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(0, prev - 1));
    }
  };

  if (!items || items.length === 0) {
    return <>{emptyState || <div style={{ color: "var(--color-text-muted)", padding: "24px", textAlign: "center" }}>No records found</div>}</>;
  }

  return (
    <div
      role="list"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus-ring"
      style={{ display: "flex", flexDirection: "column", gap: "10px", outline: "none" }}
    >
      {items.map((item, index) => {
        const key = keyExtractor(item);
        return (
          <div
            key={key}
            role="listitem"
            style={{
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: "translateY(0)",
              opacity: 1
            }}
          >
            {renderItem(item, index, focusedIndex === index)}
          </div>
        );
      })}
    </div>
  );
}
