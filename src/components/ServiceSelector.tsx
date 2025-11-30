// src/app/components/ServiceSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ServiceGroup {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  group_id: number;
  sort_order: number;
}

interface GroupWithServices extends ServiceGroup {
  services: Service[];
}

interface ServiceSelectorProps {
  selectedServices: number[];
  onChange: (services: number[]) => void;
}

export default function ServiceSelector({
  selectedServices,
  onChange,
}: ServiceSelectorProps) {
  const [groups, setGroups] = useState<GroupWithServices[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);

      const { data: groupsData } = await supabase
        .from("service_groups")
        .select("id, name, icon, sort_order")
        .order("sort_order");

      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, slug, group_id, sort_order")
        .order("sort_order");

      if (groupsData && servicesData) {
        const typedGroups = groupsData as ServiceGroup[];
        const typedServices = servicesData as Service[];

        const groupsWithServices: GroupWithServices[] = typedGroups.map(
          (group) => ({
            ...group,
            services: typedServices.filter((s) => s.group_id === group.id),
          })
        );
        setGroups(groupsWithServices);
      }

      setLoading(false);
    }

    fetchServices();
  }, [supabase]);

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleService = (serviceId: number) => {
    onChange(
      selectedServices.includes(serviceId)
        ? selectedServices.filter((id) => id !== serviceId)
        : [...selectedServices, serviceId]
    );
  };

  const toggleAllInGroup = (group: GroupWithServices) => {
    const groupServiceIds = group.services.map((s) => s.id);
    const allSelected = groupServiceIds.every((id) =>
      selectedServices.includes(id)
    );

    if (allSelected) {
      onChange(selectedServices.filter((id) => !groupServiceIds.includes(id)));
    } else {
      const newSelected = [...selectedServices];
      groupServiceIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = expandedGroups.includes(group.id);
        const selectedCount = group.services.filter((s) =>
          selectedServices.includes(s.id)
        ).length;
        const allSelected =
          group.services.length > 0 && selectedCount === group.services.length;

        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-xl border border-slate-200"
          >
            <div
              className="flex cursor-pointer items-center justify-between bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{group.icon}</span>
                <span className="font-medium text-slate-900">{group.name}</span>
                {selectedCount > 0 && (
                  <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-semibold text-leaf-700">
                    {selectedCount}
                  </span>
                )}
              </div>
              <svg
                className={`h-5 w-5 text-slate-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isExpanded && (
              <div className="border-t bg-white p-4">
                <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleAllInGroup(group)}
                    className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf--500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Tümünü Seç
                  </span>
                </label>

                <div className="grid gap-2 sm:grid-cols-2">
                  {group.services.map((service) => (
                    <label
                      key={service.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="h-4 w-4 rounded border-slate-300 text-leaf-600 focus:ring-leaf--500"
                      />
                      <span className="text-sm text-slate-700">
                        {service.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
