import React, { useState, useEffect } from 'react';
import { databaseService, type ProjectData, type DatabaseStats } from '../services/databaseService';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { Icons } from './ui/Icons';

interface ProjectDashboardProps {
  onSelectProject: (project: ProjectData) => void;
  onNewProject: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  onSelectProject,
  onNewProject
}) => {
  const [loading, setLoading] = useState(false);

  // Simplified version - skip database for now
  const stats = { totalProjects: 0, totalComponents: 0, totalVariations: 0, storageUsed: 0 };
  const projects: ProjectData[] = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your pharmaceutical LBL projects</p>
        </div>
        <Button onClick={onNewProject} className="flex items-center gap-2">
          <span className="text-lg">+</span>
          New Project
        </Button>
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-600 mb-4">
          Create your first project to get started
        </p>
        <Button onClick={onNewProject}>Create New Project</Button>
      </div>
    </div>
  );
};