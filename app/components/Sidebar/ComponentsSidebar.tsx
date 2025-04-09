import React, { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { FileSystemItem } from "~/types/files";
import ComponentItem from "./ComponentItem";

interface ComponentItemType {
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
  items: ComponentItemType[];
  children?: ComponentCategory[];
}

export default function ComponentsSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Basic");
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/packages");
  }, []);

  useEffect(() => {
    if (fetcher.data?.packages) {
      console.log("Fetched packages:", fetcher.data.packages);
      processPackages(fetcher.data.packages).then((processed) => {
        console.log("Processed categories:", processed);
        // Log the first few components to check their data
        if (processed.length > 0) {
          console.log(
            "Sample components:",
            processed
              .flatMap((cat) => cat.items)
              .slice(0, 5)
              .map((item) => ({
                id: item.id,
                name: item.name,
                icon: item.icon,
                image: item.image,
              }))
          );
        }
        setCategories(processed);
        setIsLoading(false);
      });
    } else if (fetcher.state === "idle" && !fetcher.data) {
      // If API call fails, set empty categories
      setCategories([]);
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.state]);

  const processPackages = async (
    packages: FileSystemItem[]
  ): Promise<ComponentCategory[]> => {
    console.log("Processing packages:", packages);

    const processDirectory = async (
      dir: FileSystemItem
    ): Promise<ComponentCategory> => {
      const items: ComponentItemType[] = [];
      const children: ComponentCategory[] = [];

      for (const item of dir.children || []) {
        if (item.type === "directory") {
          const childCategory = await processDirectory(item);
          children.push(childCategory);
        } else if (item.type === "file" && item.name.endsWith(".json")) {
          try {
            console.log("Loading component data for:", item.path);
            const response = await fetch(
              `/api/file-content?path=${encodeURIComponent(item.path)}`
            );
            const data = await response.json();
            console.log("Loaded component data:", data);
            console.log("Component image data:", data.image);
            console.log("Component icon data:", data.icon);

            // Get the icon path
            let iconPath = data.icon || data.image?.src || "";

            // If the icon path is relative, make it absolute
            if (
              iconPath &&
              !iconPath.startsWith("http") &&
              !iconPath.startsWith("/")
            ) {
              iconPath = `/${iconPath}`;
            }

            // Check if the image exists
            if (iconPath) {
              try {
                const imgResponse = await fetch(iconPath, { method: "HEAD" });
                if (!imgResponse.ok) {
                  console.warn(`Image not found: ${iconPath}`);
                  iconPath = ""; // Reset to empty if image doesn't exist
                }
              } catch (error) {
                console.warn(`Error checking image: ${iconPath}`, error);
                iconPath = ""; // Reset to empty if there's an error
              }
            }

            const componentItem: ComponentItemType = {
              id: item.name.replace(".json", ""),
              name: data.name || item.name.replace(".json", ""),
              path: item.path,
              icon: iconPath,
              image: data.image,
            };
            console.log("Created component item:", componentItem);
            items.push(componentItem);
          } catch (error) {
            console.error(
              `Error loading component data for ${item.path}:`,
              error
            );
            // Add a fallback component if loading fails
            items.push({
              id: item.name.replace(".json", ""),
              name: item.name.replace(".json", ""),
              path: item.path,
              icon: "",
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

  const handleDragStart = (
    e: React.DragEvent,
    component: ComponentItemType
  ) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  // Flatten categories for search
  const getAllComponents = (cats: ComponentCategory[]): ComponentItemType[] => {
    return cats.reduce((acc, cat) => {
      return [
        ...acc,
        ...cat.items,
        ...(cat.children ? getAllComponents(cat.children) : []),
      ];
    }, [] as ComponentItemType[]);
  };

  const allComponents = getAllComponents(categories);
  const filteredComponents = allComponents.filter((component) =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <span className="text-xs text-gray-500">
            {category.items.length +
              (category.children?.reduce(
                (acc, child) => acc + child.items.length,
                0
              ) || 0)}
          </span>
        </button>
        {expandedCategories.has(category.name) && (
          <>
            {category.items.length > 0 && (
              <div className="ml-4" style={{ paddingLeft: `${depth}rem` }}>
                <div className="grid grid-cols-3 gap-2">
                  {category.items.map((item) => (
                    <ComponentItem
                      key={item.id}
                      name={item.name}
                      icon={item.icon}
                      onDragStart={(e) => handleDragStart(e, item)}
                    />
                  ))}
                </div>
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
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Components
          </h2>
          <select
            className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Basic</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500">
            🔍
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading components...</p>
          </div>
        ) : searchTerm ? (
          filteredComponents.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No components found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredComponents.map((component) => (
                <ComponentItem
                  key={component.id}
                  name={component.name}
                  icon={component.icon}
                  onDragStart={(e) => handleDragStart(e, component)}
                />
              ))}
            </div>
          )
        ) : (
          <div>
            {categories.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No components found</p>
              </div>
            ) : (
              categories.map((category) => (
                <CategoryItem key={category.name} category={category} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
