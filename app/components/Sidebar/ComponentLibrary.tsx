import React, { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { FileSystemItem } from "~/types/files";

interface ComponentItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  image?: {
    src: string;
    width: number;
    height: number;
  };
}

interface ComponentCategory {
  name: string;
  items: ComponentItem[];
  children?: ComponentCategory[];
}

export default function ComponentLibrary() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(
    new Set()
  );
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/packages");
  }, []);

  useEffect(() => {
    if (fetcher.data?.packages) {
      console.log("Fetched packages:", fetcher.data.packages);
      processPackages(fetcher.data.packages).then((processed) => {
        console.log("Processed categories:", processed);
        setCategories(processed);
      });
    }
  }, [fetcher.data]);

  const processPackages = async (
    packages: FileSystemItem[]
  ): Promise<ComponentCategory[]> => {
    console.log("Processing packages:", packages);

    const processDirectory = async (
      dir: FileSystemItem
    ): Promise<ComponentCategory> => {
      const items: ComponentItem[] = [];
      const children: ComponentCategory[] = [];

      for (const item of dir.children || []) {
        if (item.type === "directory") {
          children.push(await processDirectory(item));
        } else if (item.type === "file" && item.name.endsWith(".json")) {
          try {
            console.log("Loading component data for:", item.path);
            const response = await fetch(
              `/api/file-content?path=${encodeURIComponent(item.path)}`
            );
            const data = await response.json();
            console.log("Loaded component data:", data);

            const componentItem: ComponentItem = {
              id: item.name.replace(".json", ""),
              name: data.name || item.name.replace(".json", ""),
              path: item.path,
              icon: "🔲",
              image: data.image,
            };
            console.log("Created component item:", componentItem);
            items.push(componentItem);
          } catch (error) {
            console.error(
              `Error loading component data for ${item.path}:`,
              error
            );
            items.push({
              id: item.name.replace(".json", ""),
              name: item.name.replace(".json", ""),
              path: item.path,
              icon: "🔲",
            });
          }
        }
      }

      return {
        name: dir.name,
        items,
        ...(children.length > 0 && { children }),
      };
    };

    const categories = await Promise.all(
      packages.filter((pkg) => pkg.type === "directory").map(processDirectory)
    );

    console.log("Final categories:", categories);
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const CategoryItem = ({
    category,
    depth = 0,
  }: {
    category: ComponentCategory;
    depth?: number;
  }) => {
    const hasContent =
      category.items.length > 0 || (category.children?.length ?? 0) > 0;
    if (!hasContent) return null;

    return (
      <div>
        <button
          className="w-full px-4 py-1 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          style={{ paddingLeft: `${1 + depth}rem` }}
          onClick={() => toggleCategory(category.name)}
        >
          <span className="flex items-center">
            <span className="mr-2">
              {expandedCategories.has(category.name) ? "📂" : "📁"}
            </span>
            {category.name}
          </span>
          <span className="text-xs text-gray-500">{category.items.length}</span>
        </button>
        {expandedCategories.has(category.name) && (
          <>
            {category.items.length > 0 && (
              <div className="ml-4" style={{ paddingLeft: `${depth}rem` }}>
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={item.name.replace(".json", "")}
                      checked={selectedComponents.has(
                        item.name.replace(".json", "")
                      )}
                      onChange={() => {
                        setSelectedComponents((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.name.replace(".json", ""))) {
                            next.delete(item.name.replace(".json", ""));
                          } else {
                            next.add(item.name.replace(".json", ""));
                          }
                          return next;
                        });
                      }}
                    />
                    <label
                      htmlFor={item.name.replace(".json", "")}
                      className="ml-2"
                    >
                      {item.name.replace(".json", "")}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {category.children?.map((child) => (
              <CategoryItem
                key={child.name}
                category={child}
                depth={depth + 1}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold">Components</span>
        <span
          className="transform transition-transform duration-200"
          style={{
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="py-2">
          {fetcher.state === "loading" ? (
            <div className="px-4 text-sm text-gray-500">
              Loading components...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 text-sm text-gray-500">
              No components found
            </div>
          ) : (
            <>
              {categories.map((category) => (
                <CategoryItem key={category.name} category={category} />
              ))}
              <button
                className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  console.log(
                    "Selected Components:",
                    Array.from(selectedComponents)
                  );
                }}
              >
                Log Selected Components
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
