import * as Form from "@/components/ui/form";
import { Button, Input, Label } from "@/components/ui";
import { ButtonCore, InputCore } from "@/domains/ui";
import { Result } from "@/domains/result";

export class MediaProfileValuesCore {
  $name = new InputCore({
    defaultValue: "",
  });
  $originalName = new InputCore({
    defaultValue: "",
  });
  $submit = new ButtonCore({
    onClick: () => {
      const name = this.$name.value;
      const episodeCount = this.$originalName.value;
      const values = {
        name,
        episodeCount,
      };
      console.log(values);
    },
  });
  $reset = new ButtonCore({
    onClick: () => {
      // ...
    },
  });

  validate() {
    const name = this.$name.value;
    const originalName = this.$originalName.value;
    if (!name) {
      return Result.Err("缺少 name 参数");
    }
    const values = {
      name,
      originalName,
    };
    return Result.Ok(values);
  }
}

export const MediaProfileValues = (props: { store: MediaProfileValuesCore }) => {
  const { store } = props;

  return (
    <div>
      <div class="space-y-4">
        <div class="field flex items-center space-x-4">
          <Label class="w-[68px] text-left">名称</Label>
          <div class="flex-1">
            <Input store={store.$name} />
          </div>
        </div>
        <div class="field flex items-center space-x-4">
          <Label class="w-[68px] text-left">原始名称</Label>
          <div class="flex-1">
            <Input store={store.$originalName} />
          </div>
        </div>
      </div>
    </div>
  );
};
