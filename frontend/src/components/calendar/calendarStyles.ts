// FullCalendar custom styling

import tokens from "../../tokens";

export const calendarStyles = `
  .fc {
    --fc-border-color: ${tokens.colors.border};
    --fc-button-bg-color: ${tokens.colors.surface};
    --fc-button-border-color: ${tokens.colors.border};
    --fc-button-text-color: ${tokens.colors.text};
    --fc-button-hover-bg-color: ${tokens.colors.surfaceSecondary};
    --fc-button-hover-border-color: ${tokens.colors.borderLight};
    --fc-button-active-bg-color: ${tokens.colors.accent};
    --fc-button-active-border-color: ${tokens.colors.accent};
    --fc-page-bg-color: transparent;
    --fc-neutral-bg-color: ${tokens.colors.surface};
    --fc-today-bg-color: rgba(212, 165, 116, 0.08);
    --fc-event-bg-color: ${tokens.colors.accent};
    --fc-event-border-color: ${tokens.colors.accent};
    --fc-event-text-color: ${tokens.colors.background};
    --fc-now-indicator-color: ${tokens.colors.accent};
    font-family: ${tokens.fonts.elegant};
  }

  .fc .fc-toolbar-title {
    font-family: ${tokens.fonts.elegant};
    font-size: 1.5rem;
    font-weight: 500;
    color: ${tokens.colors.text};
  }

  .fc .fc-button {
    font-family: ${tokens.fonts.elegant};
    font-weight: 400;
    border-radius: ${tokens.radius.sm}px;
    padding: 8px 16px;
    transition: all 0.2s ease;
  }

  .fc .fc-button:focus {
    box-shadow: 0 0 0 2px ${tokens.colors.accent}44;
  }

  .fc .fc-button-primary:not(:disabled).fc-button-active,
  .fc .fc-button-primary:not(:disabled):active {
    background-color: ${tokens.colors.accent};
    border-color: ${tokens.colors.accent};
    color: ${tokens.colors.background};
  }

  .fc .fc-col-header-cell {
    background: ${tokens.colors.surface};
    border-color: ${tokens.colors.border};
  }

  .fc .fc-col-header-cell-cushion {
    font-family: ${tokens.fonts.elegant};
    font-weight: 500;
    color: ${tokens.colors.textSecondary};
    padding: 12px 4px;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
  }

  .fc .fc-daygrid-day {
    transition: background-color 0.15s ease;
  }

  .fc .fc-daygrid-day:hover {
    background-color: rgba(212, 165, 116, 0.04);
  }

  .fc .fc-daygrid-day-number {
    font-family: ${tokens.fonts.elegant};
    color: ${tokens.colors.text};
    padding: 8px 12px;
    font-size: 1.05rem;
    display: block;
    width: 100%;
    float: none;
    text-align: right;
  }

  .fc .fc-day-today .fc-daygrid-day-number {
    background: ${tokens.colors.accent};
    color: ${tokens.colors.background};
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    align-self: flex-end;
    margin-left: auto;
  }

  .fc .fc-daygrid-day-top {
    justify-content: center;
    align-items: stretch;
    flex-direction: column;
  }

  .fc .calendar-counts-event {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .fc .calendar-counts-event .fc-event-main {
    padding: 0;
    background: transparent;
  }

  .fc .fc-day-other .fc-daygrid-day-number {
    color: ${tokens.colors.textMuted};
  }

  .fc .fc-scrollgrid {
    border-radius: ${tokens.radius.lg}px;
    overflow: hidden;
    border: 1px solid ${tokens.colors.border};
  }

  .fc .fc-scrollgrid-section > * {
    border-color: ${tokens.colors.border};
  }

  .fc .fc-timegrid-slot {
    height: 48px;
  }

  .fc .fc-timegrid-slot-label-cushion {
    font-family: ${tokens.fonts.elegant};
    color: ${tokens.colors.textMuted};
    font-size: 0.8rem;
  }

  .fc .fc-timegrid-now-indicator-line {
    border-color: ${tokens.colors.accent};
  }

  .fc .fc-timegrid-now-indicator-arrow {
    border-color: ${tokens.colors.accent};
    border-top-color: transparent;
    border-bottom-color: transparent;
  }

  .fc .fc-event {
    border-radius: ${tokens.radius.sm}px;
    font-family: ${tokens.fonts.elegant};
    padding: 2px 6px;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .fc .fc-daygrid-event-dot {
    border-color: ${tokens.colors.accent};
  }

  .fc .fc-toolbar {
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 12px;
  }

  .fc .fc-toolbar-chunk {
    display: flex;
    align-items: center;
  }

  .fc-theme-standard td,
  .fc-theme-standard th {
    border-color: ${tokens.colors.border};
  }

  .fc .fc-popover {
    background: ${tokens.colors.surface};
    border: 1px solid ${tokens.colors.border};
    border-radius: ${tokens.radius.md}px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 50;
  }

  .fc .fc-popover-header {
    background: ${tokens.colors.surfaceSecondary};
    color: ${tokens.colors.text};
    font-family: ${tokens.fonts.elegant};
    padding: 8px 12px;
  }

  .fc .fc-more-link {
    color: ${tokens.colors.accent};
    font-family: ${tokens.fonts.elegant};
  }

  .fc .fc-more-link:hover {
    color: ${tokens.colors.accentHover};
  }

  .fc-timegrid-day-view .fc-timegrid-event {
    width: 16.666%;
    left: 0 !important;
  }

  @keyframes calendar-slide-next {
    from {
      opacity: 0;
      transform: translateX(18px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes calendar-slide-prev {
    from {
      opacity: 0;
      transform: translateX(-18px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
