"use client";

import { type ReactNode, useState } from "react";

type Props = {
  tabs: {
    label: string;
    content: ReactNode;
  }[];
};

export const Tabs = ({ tabs }: Props) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <ul className="-mb-px flex flex-wrap">
          {tabs.map((tab, index) => (
            <li key={index} className="me-2">
              <button
                type="button"
                onClick={() => setActiveTab(index)}
                className={`inline-block rounded-t-lg border-b-2 p-4 ${
                  activeTab === index
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
                aria-current={activeTab === index ? "page" : undefined}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4">{tabs[activeTab].content}</div>
    </div>
  );
};
