import { BaseDomain, Handler } from "@/domains/base";

enum Events {
  Read,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Read]: {
    filename: string;
    content: string;
  };
  [Events.StateChange]: SubtitleReaderState;
};
type SubtitleReaderState = {
  loading: boolean;
  content: string | null;
};
type SubtitleReaderProps = {
  onRead?: (file: { filename: string; content: string }) => void;
};
export class SubtitleReaderCore extends BaseDomain<TheTypesOfEvents> {
  loading = false;
  content: string | null = null;

  get state() {
    return {
      loading: this.loading,
      content: this.content,
    };
  }

  constructor(props: Partial<{ _name: string }> & SubtitleReaderProps) {
    super(props);

    const { onRead } = props;
    if (onRead) {
      this.onRead(onRead);
    }
  }

  read(file: File) {
    const reader = new FileReader();
    this.loading = true;
    this.emit(Events.StateChange, { ...this.state });
    reader.onload = (e) => {
      this.loading = false;
      if (e.target) {
        const content = e.target.result as string;
        this.content = content;
        this.emit(Events.Read, {
          filename: file.name,
          content,
        });
      }
      this.emit(Events.StateChange, { ...this.state });
    };
    reader.readAsText(file);
  }
  clear() {
    this.content = null;
    this.emit(Events.StateChange, { ...this.state });
  }

  onRead(handler: Handler<TheTypesOfEvents[Events.Read]>) {
    return this.on(Events.Read, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
