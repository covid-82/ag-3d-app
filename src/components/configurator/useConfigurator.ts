"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sanitize } from "@/lib/configurator/rules";
import type { KindSpec } from "@/lib/configurator/kinds";
import type { DesignConfig, Limits } from "@/lib/configurator/types";

interface State {
  config: DesignConfig;
  past: DesignConfig[];
  future: DesignConfig[];
}

type Patch = Partial<DesignConfig> | ((c: DesignConfig) => Partial<DesignConfig>);

/**
 * State konfigurator dengan aturan produk, undo/redo, dan reset.
 * Setiap perubahan lewat `sanitize`, jadi kombinasi yang tidak valid tidak pernah sampai ke model 3D.
 */
export function useConfigurator(spec: KindSpec, limits: Limits, initial: DesignConfig) {
  const base = useRef(sanitize(spec, limits, initial).config);
  const [state, setState] = useState<State>({ config: base.current, past: [], future: [] });
  const ref = useRef(state);
  const meta = useRef({ key: "", ts: 0 });
  const [notices, setNotices] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: State) => {
    ref.current = next;
    setState(next);
  }, []);

  const flash = useCallback((list: string[]) => {
    if (!list.length) return;
    setNotices(Array.from(new Set(list)));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotices([]), 6000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  /** `key` mengelompokkan perubahan beruntun (mis. menggeser slider) menjadi satu langkah undo. */
  const apply = useCallback(
    (patch: Patch, key = "edit") => {
      const cur = ref.current;
      const p = typeof patch === "function" ? patch(cur.config) : patch;
      const { config: next, notices: n } = sanitize(spec, limits, { ...cur.config, ...p });
      flash(n);
      if (JSON.stringify(next) === JSON.stringify(cur.config)) return;
      const now = Date.now();
      const coalesce = key !== "edit" && meta.current.key === key && now - meta.current.ts < 800;
      meta.current = { key, ts: now };
      commit({
        config: next,
        past: coalesce ? cur.past : [...cur.past, cur.config].slice(-60),
        future: [],
      });
    },
    [spec, limits, flash, commit],
  );

  const undo = useCallback(() => {
    const cur = ref.current;
    if (!cur.past.length) return;
    commit({ config: cur.past[cur.past.length - 1], past: cur.past.slice(0, -1), future: [cur.config, ...cur.future] });
  }, [commit]);

  const redo = useCallback(() => {
    const cur = ref.current;
    if (!cur.future.length) return;
    commit({ config: cur.future[0], past: [...cur.past, cur.config], future: cur.future.slice(1) });
  }, [commit]);

  const reset = useCallback(() => {
    const cur = ref.current;
    if (JSON.stringify(cur.config) === JSON.stringify(base.current)) return;
    commit({ config: base.current, past: [...cur.past, cur.config].slice(-60), future: [] });
  }, [commit]);

  return {
    config: state.config,
    apply,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    isModified: JSON.stringify(state.config) !== JSON.stringify(base.current),
    notices,
    dismissNotices: () => setNotices([]),
  };
}
