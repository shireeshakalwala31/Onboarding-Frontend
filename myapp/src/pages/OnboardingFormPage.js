// src/pages/OnboardingFormPage.jsx
import React, { useRef, useState, useEffect } from "react";

// ✅ updated paths – assuming these files are in src/components

import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import Sidebar from "../Sidebar";

// small helper to generate simple unique ids
const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function OnboardingFormPage() {
  // list of steps (order matters)
  const steps = [
    "personal",
    "pf",
    "academic",
    "experience",
    "family",
    "declaration",
    // "office", // Hidden as per requirement
  ];

  // refs for focusing / scroll anchors
  const refs = {
    personal: useRef(null),
    pf: useRef(null),
    academic: useRef(null),
    experience: useRef(null),
    family: useRef(null),
    declaration: useRef(null),
    office: useRef(null),
    list: useRef(null),
  };

  // employees (persisted)
  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("employees") || "[]");
    } catch {
      return [];
    }
  });

  // current step index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  const [active, setActive] = useState(currentStep);
  const [showList, setShowList] = useState(false);

  // edit flow: editingIndex refers to index in employees array
  const [editingIndex, setEditingIndex] = useState(null);
  const [initialData, setInitialData] = useState(null);

  // draft accumulates intermediate saves (not committed to employees until final)
  const [draft, setDraft] = useState(null);

  // persist employees to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("employees", JSON.stringify(employees));
    } catch (e) {
      console.warn("Could not persist employees", e);
    }
  }, [employees]);

  // navigate to named step (from Sidebar)
  const goToStep = (id) => {
    const idx = steps.indexOf(id);
    if (idx >= 0) {
      setCurrentStepIndex(idx);
      setActive(id);
      setShowList(false);
    }
  };

  const nextStep = () => {
    setCurrentStepIndex((i) => {
      const next = Math.min(i + 1, steps.length - 1);
      setActive(steps[next]);
      return next;
    });
  };

  const prevStep = () => {
    setCurrentStepIndex((i) => {
      const prev = Math.max(i - 1, 0);
      setActive(steps[prev]);
      return prev;
    });
  };

  // onSave called by EmployeeForm:
  const handleSave = (data, { stayOnStep = false } = {}) => {
    if (stayOnStep) {
      // merge latest section data into draft
      setDraft((prev) => {
        if (!prev) {
          return { ...data };
        }
        return { ...prev, ...data };
      });
      setShowList(false);
      return;
    }

    // Final save: combine draft + incoming data
    const finalData = { ...(draft || {}), ...(data || {}) };

    // ensure finalData has an id
    if (!finalData.id) {
      finalData.id = makeId();
    }

    if (editingIndex !== null && editingIndex >= 0) {
      // update existing employee record
      setEmployees((prev) => {
        const next = [...prev];
        next[editingIndex] = finalData;
        return next;
      });
      setEditingIndex(null);
      setInitialData(null);
    } else {
      // add new employee
      setEmployees((prev) => [...prev, finalData]);
    }

    // clear draft
    setDraft(null);

    // If last step, show list; else move to next step
    if (currentStepIndex < steps.length - 1) {
      nextStep();
      setShowList(false);
    } else {
      setShowList(true);
      setTimeout(() => {
        if (refs.list.current)
          refs.list.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
      setCurrentStepIndex(0);
      setActive(steps[0]);
    }
  };

  // Edit an existing record
  const handleEdit = (index) => {
    const item = employees[index];
    if (!item) return;
    setInitialData(item); // prefill form
    setDraft(item); // editing uses same draft accumulation
    setEditingIndex(index);
    setCurrentStepIndex(0);
    setActive(steps[0]);
    setShowList(false);
  };

  const handleDelete = (index) => {
    const ok = window.confirm(
      "Delete this employee record? This cannot be undone."
    );
    if (!ok) return;
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setInitialData(null);
    setDraft(null);
  };

  useEffect(() => {
    setActive(steps[currentStepIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  const handleShowList = () => {
    setShowList(true);
    setTimeout(() => {
      if (refs.list.current)
        refs.list.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  // optional helper to merge duplicates by email
  useEffect(() => {
    window.__mergeEmployeesByEmail = () => {
      const byEmail = {};
      const merged = [];
      for (const e of employees) {
        if (e.email || (e.personal && e.personal.email)) {
          const email = (
            e.email ||
            (e.personal && e.personal.email) ||
            ""
          ).toLowerCase();
          if (!email) {
            merged.push(e);
            continue;
          }
          if (!byEmail[email]) {
            byEmail[email] = { ...e };
            merged.push(byEmail[email]);
          } else {
            Object.assign(byEmail[email], e);
          }
        } else {
          merged.push(e);
        }
      }
      setEmployees(merged);
    };
  }, [employees]);

  return (
    <div className="min-h-screen flex bg-transparent">
      <Sidebar
        goToStep={goToStep}
        active={active}
        steps={steps}
        onShowList={handleShowList}
        showListActive={showList}
      />

      <main className="ml-64 p-10 w-full">
        <div ref={refs.header}></div>

        {!showList && (
          <EmployeeForm
            refs={refs}
            steps={steps}
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            goToStep={goToStep}
            nextStep={nextStep}
            prevStep={prevStep}
            onSave={handleSave}
            mode={editingIndex !== null ? "edit" : "new"}
            initialData={initialData || draft}
            onCancelEdit={cancelEdit}
          />
        )}

        {showList && (
          <div ref={refs.list} className="mt-8">
            <EmployeeList
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>
    </div>
  );
}
