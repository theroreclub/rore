"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function DetailDrawer({ trigger, title, section, className = "admin-button", children }: {
  trigger: ReactNode; title: string; section: string; className?: string; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [opened, setOpened] = useState(false);
  return <>
    <button type="button" className={className} aria-haspopup="dialog" onClick={() => { setOpened(true); dialog.current?.showModal(); }}>{trigger}</button>
    <dialog ref={dialog} aria-labelledby={titleId} className="admin-drawer" onClick={event => {
      if (event.target === dialog.current && event.clientX < dialog.current.getBoundingClientRect().left) dialog.current.close();
    }}>
      <div className="drawer-top"><span>{section}</span><button type="button" autoFocus aria-label="Close panel" onClick={() => dialog.current?.close()}><X size={19} /></button></div>
      <div className="drawer-body"><h2 id={titleId}>{title}</h2>{opened && children}</div>
    </dialog>
  </>;
}
