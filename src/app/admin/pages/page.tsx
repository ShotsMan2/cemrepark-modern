"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash, Globe, Lock } from "lucide-react";

export default function PagesManagement() {
  const [pages] = useState([
    {
      id: 1,
      title: "About Us",
      slug: "/about",
      status: "Published",
      visibility: "Public",
      updated: "2 days ago",
    },
    {
      id: 2,
      title: "Terms of Service",
      slug: "/terms",
      status: "Published",
      visibility: "Public",
      updated: "1 week ago",
    },
    {
      id: 3,
      title: "Privacy Policy",
      slug: "/privacy",
      status: "Published",
      visibility: "Public",
      updated: "1 week ago",
    },
    {
      id: 4,
      title: "Wholesale Inquiry",
      slug: "/wholesale",
      status: "Draft",
      visibility: "Private",
      updated: "Just now",
    },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
            Pages Management
          </h1>
          <p className="text-sm text-foreground/60 dark:text-foreground/50">
            Create and manage static content pages
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent text-foreground text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-foreground mb-4">
              Quick Add
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground focus:ring-2 focus:ring-accent outline-none transition-shadow"
                  placeholder="e.g. Return Policy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">
                  Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-600 bg-foreground/5 text-foreground/60 text-sm">
                    /
                  </span>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-r-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground focus:ring-2 focus:ring-accent outline-none transition-shadow"
                    placeholder="return-policy"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">
                  Status
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground focus:ring-2 focus:ring-accent outline-none transition-shadow">
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>
              <button
                type="button"
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Open in Advanced Editor
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-foreground/5/50 text-gray-600 dark:text-foreground/50 font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Page Details</th>
                    <th className="px-6 py-4">Visibility</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-foreground">
                          {page.title}
                        </div>
                        <div className="text-foreground/60 dark:text-foreground/50 text-xs mt-0.5">
                          {page.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-foreground/50 text-xs">
                          {page.visibility === "Public" ? (
                            <Globe className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                          {page.visibility}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${page.status === "Published" ? "bg-accent text-accent dark:bg-accent/30 dark:text-accent" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-foreground/50"}`}
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground/60 dark:text-foreground/50 text-xs">
                        {page.updated}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 text-foreground/60 hover:text-accent hover:bg-accent dark:hover:bg-accent/30 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-foreground/60 hover:text-danger hover:bg-danger dark:hover:bg-danger/30 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
