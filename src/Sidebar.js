import React from "react";
import {
  FaCamera,
  FaUser,
  FaBuilding,
  FaUniversity,
  FaBriefcase,
  FaUsers,
  FaList,
} from "react-icons/fa";

/**
 * Sidebar for multi-step Employee form.
 *
 * Props:
 * - goToStep(stepId)            // preferred: jump to a step
 * - scrollTo(stepId)            // fallback (keeps backward compatibility)
 * - active: currently active step id (string)
 * - steps: array of step ids (optional, used to build menu order)
 * - onShowList(): optional callback to show the employee list view
 * - showListActive: boolean, whether the list view is currently active
 */
export default function Sidebar({
  goToStep,
  scrollTo,
  active = "",
  steps = [
    "photo",
    "personal",
    "pf",
    "academic",
    "experience",
    "family",
    "declaration",
    // "office", // Hidden as per requirement
  ],
  onShowList,
  showListActive = false,
}) {
  // small mapping from id -> label + icon (you can extend)
  const map = {
    photo: { label: "Photo", icon: <FaCamera /> },
    personal: { label: "Personal", icon: <FaUser /> },
    pf: { label: "PF / UAN", icon: <FaBuilding /> },
    academic: { label: "Academic", icon: <FaUniversity /> },
    experience: { label: "Experience", icon: <FaBriefcase /> },
    family: { label: "Family", icon: <FaUsers /> },
    declaration: { label: "Declaration", icon: <FaBuilding /> },
    office: { label: "Office Use", icon: <FaBuilding /> },
  };

  const handleClick = (id) => {
    // prefer goToStep (App.js), fallback to scrollTo (older behavior)
    if (typeof goToStep === "function") return goToStep(id);
    if (typeof scrollTo === "function") return scrollTo(id);
    return null;
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-white/70 backdrop-blur-md shadow-xl border-r border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">AMAZON IT SOLUTIONS</h1>

      <nav className="space-y-2">
        {steps.map((id) => {
          const item = map[id] || { label: id, icon: <FaList /> };
          const isActive = !showListActive && active === id;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition
                ${isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-blue-100"}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t" />

        {/* Employees (list) button - Hidden as per requirement */}
        {/* <button
          onClick={() => {
            if (typeof onShowList === "function") onShowList();
            else if (typeof goToStep === "function") goToStep("list");
            else if (typeof scrollTo === "function") scrollTo("list");
          }}
          className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition
            ${showListActive ? "bg-green-600 text-white shadow-md" : "text-gray-700 hover:bg-green-100"}`}
        >
          <span className="text-xl"><FaList /></span>
          <span className="font-medium">Employee List</span>
        </button> */}
      </nav>
    </aside>
  );
}