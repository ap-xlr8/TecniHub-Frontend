import { Component, computed, effect, input, output, signal } from '@angular/core';

interface CalendarDayCell {
  isoDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const QUICK_TIMES = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

@Component({
  selector: 'app-schedule-agenda-picker',
  template: `
    <div class="agenda-picker">
      <button
        type="button"
        class="agenda-trigger"
        [attr.aria-expanded]="calendarOpen()"
        aria-haspopup="dialog"
        (click)="toggleCalendar()"
      >
        <span class="agenda-trigger-main">
          <span class="agenda-trigger-icon" aria-hidden="true">📅</span>
          <span [class.muted-value]="!formattedSelection()">
            {{ formattedSelection() || 'Seleccionar fecha y hora (formato 24 hrs)' }}
          </span>
        </span>
        <span class="agenda-trigger-action">
          {{ calendarOpen() ? 'Ocultar agenda' : 'Abrir agenda' }}
        </span>
      </button>

      @if (calendarOpen()) {
        <div class="agenda-panel" role="group" aria-label="Agenda de cita en formato de 24 horas">
          <div class="agenda-calendar">
            <div class="agenda-header">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                aria-label="Mes anterior"
                (click)="shiftMonth(-1)"
              >
                ‹
              </button>
              <strong class="agenda-month-label">{{ monthLabel() }}</strong>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                aria-label="Mes siguiente"
                (click)="shiftMonth(1)"
              >
                ›
              </button>
            </div>

            <div class="agenda-weekdays" aria-hidden="true">
              @for (day of weekdays; track day) {
                <span>{{ day }}</span>
              }
            </div>

            <div class="agenda-days" role="grid" [attr.aria-label]="monthLabel()">
              @for (cell of calendarCells(); track cell.isoDate) {
                <button
                  type="button"
                  class="agenda-day"
                  [class.agenda-day--outside]="!cell.inCurrentMonth"
                  [class.agenda-day--today]="cell.isToday"
                  [class.agenda-day--selected]="cell.isSelected"
                  [disabled]="cell.isPast"
                  [attr.aria-pressed]="cell.isSelected"
                  (click)="selectDate(cell.isoDate)"
                >
                  {{ cell.dayNumber }}
                </button>
              }
            </div>
          </div>

          <div class="agenda-time-col">
            <p class="agenda-time-title">Hora de atención (24 hrs)</p>

            <div class="agenda-time-selects">
              <div class="field">
                <label for="agenda-hour-select">Hora (00–23)</label>
                <select
                  id="agenda-hour-select"
                  class="input-control"
                  [value]="selectedHour()"
                  (change)="onHourChange($event)"
                >
                  @for (h of hours24; track h) {
                    <option [value]="h">{{ h }}:00</option>
                  }
                </select>
              </div>
              <div class="field">
                <label for="agenda-minute-select">Minutos</label>
                <select
                  id="agenda-minute-select"
                  class="input-control"
                  [value]="selectedMinute()"
                  (change)="onMinuteChange($event)"
                >
                  @for (m of minutesOptions; track m) {
                    <option [value]="m">{{ m }} min</option>
                  }
                </select>
              </div>
            </div>

            <div class="agenda-quick-times" aria-label="Horarios rápidos 24 horas">
              @for (slot of quickTimes; track slot) {
                <button
                  type="button"
                  class="agenda-slot-chip"
                  [class.agenda-slot-chip--active]="currentTime24() === slot"
                  (click)="selectQuickTime(slot)"
                >
                  {{ slot }} hrs
                </button>
              }
            </div>

            <div class="agenda-summary-box">
              <span>Seleccionado:</span>
              <strong>{{ formattedSelection() || 'Elige un día en el calendario' }}</strong>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ScheduleAgendaPickerComponent {
  readonly value = input<string>('');
  readonly valueChange = output<string>();

  protected readonly weekdays = WEEKDAY_LABELS;
  protected readonly quickTimes = QUICK_TIMES;
  protected readonly hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  protected readonly minutesOptions = ['00', '15', '30', '45'];

  protected readonly calendarOpen = signal(true);
  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly selectedDate = signal('');
  protected readonly selectedHour = signal('10');
  protected readonly selectedMinute = signal('00');

  protected readonly currentTime24 = computed(
    () => `${this.selectedHour()}:${this.selectedMinute()}`,
  );

  protected readonly monthLabel = computed(
    () => `${MONTH_NAMES[this.viewMonth()]} ${this.viewYear()}`,
  );

  protected readonly formattedSelection = computed(() => {
    const isoDate = this.selectedDate();
    if (!isoDate) {
      return '';
    }
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year} · ${this.selectedHour()}:${this.selectedMinute()} hrs`;
  });

  protected readonly calendarCells = computed<CalendarDayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const todayIso = this.toIsoDate(new Date());
    const chosen = this.selectedDate();

    const firstDay = new Date(year, month, 1);
    const mondayIndex = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - mondayIndex);

    const cells: CalendarDayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      );
      const isoDate = this.toIsoDate(current);
      cells.push({
        isoDate,
        dayNumber: current.getDate(),
        inCurrentMonth: current.getMonth() === month,
        isPast: isoDate < todayIso,
        isToday: isoDate === todayIso,
        isSelected: isoDate === chosen,
      });
    }
    return cells;
  });

  constructor() {
    effect(() => {
      const raw = this.value().trim();
      if (!raw) {
        return;
      }
      const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(raw);
      if (!match) {
        return;
      }
      const [, datePart, hourPart, minutePart] = match;
      this.selectedDate.set(datePart);
      this.selectedHour.set(hourPart);
      this.selectedMinute.set(
        this.minutesOptions.includes(minutePart) ? minutePart : this.nearestMinute(minutePart),
      );
      const [y, m] = datePart.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m)) {
        this.viewYear.set(y);
        this.viewMonth.set(m - 1);
      }
    });
  }

  protected toggleCalendar(): void {
    this.calendarOpen.update((open) => !open);
  }

  protected shiftMonth(delta: number): void {
    const shifted = new Date(this.viewYear(), this.viewMonth() + delta, 1);
    this.viewYear.set(shifted.getFullYear());
    this.viewMonth.set(shifted.getMonth());
  }

  protected selectDate(isoDate: string): void {
    this.selectedDate.set(isoDate);
    this.emitValue();
  }

  protected onHourChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedHour.set(value);
    this.ensureDateAndEmit();
  }

  protected onMinuteChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMinute.set(value);
    this.ensureDateAndEmit();
  }

  protected selectQuickTime(slot: string): void {
    const [h, m] = slot.split(':');
    this.selectedHour.set(h);
    this.selectedMinute.set(m);
    this.ensureDateAndEmit();
  }

  private ensureDateAndEmit(): void {
    if (!this.selectedDate()) {
      this.selectedDate.set(this.toIsoDate(new Date()));
    }
    this.emitValue();
  }

  private emitValue(): void {
    const isoDate = this.selectedDate();
    if (!isoDate) {
      return;
    }
    this.valueChange.emit(`${isoDate}T${this.selectedHour()}:${this.selectedMinute()}`);
  }

  private toIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private nearestMinute(rawMin: string): string {
    const n = Number(rawMin);
    if (Number.isNaN(n)) return '00';
    if (n < 8) return '00';
    if (n < 23) return '15';
    if (n < 38) return '30';
    return '45';
  }
}
