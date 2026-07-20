"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function BannersPage() {
  const [banners] = useState([
    { id: 1, title: 'Summer Sale', location: 'Homepage Hero', status: 'Active', image: '/banners/summer.jpg' },
    { id: 2, title: 'New Hijab Collection', location: 'Category Top', status: 'Active', image: '/banners/hijab.jpg' },
    { id: 3, title: 'Ramadan Special', location: 'Homepage Mid', status: 'Draft', image: '/banners/ramadan.jpg' },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Banner Management</h1>
          <p className="text-sm text-foreground/60 dark:text-foreground/50">Manage your promotional banners and sliders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-foreground mb-4">Add / Edit Banner</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">Banner Title</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="e.g. Winter Collection" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">Display Location</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                  <option>Homepage Hero Slider</option>
                  <option>Category Top</option>
                  <option>Checkout Page</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-foreground/70 mb-1">Image URL or Upload</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-indigo-500 transition-colors cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-foreground/50 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 dark:text-foreground/50">
                      <span className="relative rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-foreground/60">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" defaultChecked />
                  <span className="text-sm text-gray-700 dark:text-foreground/70">Set as Active</span>
                </label>
              </div>
              <button type="button" className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground font-medium rounded-lg transition-colors">
                Save Banner
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-foreground/5/50 text-gray-600 dark:text-foreground/50 font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Banner Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-foreground/50 text-xs overflow-hidden border border-gray-200 dark:border-gray-600">
                          {banner.title.charAt(0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-foreground">{banner.title}</div>
                        <div className="text-foreground/60 dark:text-foreground/50 text-xs mt-0.5">{banner.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${banner.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-foreground/50'}`}>
                          {banner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-foreground/60 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-foreground/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
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
