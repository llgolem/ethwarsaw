import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ModelSelectorProps {
  selectedModel: "llama" | "qwen2" | null
  onSelectModel: (model: "llama" | "qwen2") => void
}

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const getCreditCharge = () => {
    switch (selectedModel) {
      case "llama":
        return 1
      case "qwen2":
        return 0.5
      default:
        return 0
    }
  }

  return (
    <div className="relative hidden flex-col items-start gap-8 md:flex overflow-auto">
      <form className="grid w-full items-start gap-6">
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
          <div className="grid gap-3">
            <Label htmlFor="model">Model</Label>
            <Select onValueChange={onSelectModel}>
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <div className="grid gap-0.5">
                      <p>
                        <span className="font-medium text-foreground">
                          Llama 3.1
                        </span>
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="qwen2">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <div className="grid gap-0.5">
                      <p>
                        <span className="font-medium text-foreground">
                          Qwen2
                        </span>
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedModel && (
            <div className="grid gap-3 p-3 border rounded-lg">
              <p className="text-sm font-medium">
                {selectedModel === "llama" ? "Llama 3.1" : "Qwen2"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedModel === "llama"
                  ? "Advanced language model"
                  : "Efficient and fast model"}
              </p>
              <p className="text-sm">
                Credit charge: {getCreditCharge()} credits per message
              </p>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  )
}
