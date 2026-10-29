import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/general/PageHeader"
import { Check, Loader2, Pencil, Plus, Trash2, Tag, X } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolPaymentItems,
  useCreateSchoolPaymentItems,
  useUpdateSchoolPaymentItem,
} from "@/hooks/feeManagement"

export default function PaymentItemsPage() {
  const schoolId = useSchoolId()
  const { paymentItems, isLoading } = useGetSchoolPaymentItems(schoolId)
  const { createSchoolPaymentItemsAsync, isPending: isCreating } =
    useCreateSchoolPaymentItems()
  const { updateSchoolPaymentItemAsync, isPending: isUpdating } =
    useUpdateSchoolPaymentItem()

  const [inputs, setInputs] = useState<string[]>([""])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleChange = (index: number, value: string) => {
    const updated = [...inputs]
    updated[index] = value
    setInputs(updated)
  }

  const handleAddMore = () => {
    setInputs((prev) => [...prev, ""])
  }

  const handleSave = async () => {
    const valid = inputs.map((v) => v.trim()).filter(Boolean)
    if (valid.length === 0) return
    await createSchoolPaymentItemsAsync({
      schoolId,
      items: valid.map((name) => ({ name })),
    })
    setInputs([""])
  }

  const handleRemoveInput = (index: number) => {
    if (inputs.length === 1) {
      setInputs([""])
      return
    }
    setInputs(inputs.filter((_, i) => i !== index))
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditValue(name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  const saveEdit = async () => {
    const trimmed = editValue.trim()
    if (trimmed && editingId) {
      await updateSchoolPaymentItemAsync({ id: editingId, name: trimmed })
    }
    cancelEdit()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Items"
        description="Define payment categories like Uniform, Stationeries, etc."
      />

      {/* Input area */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Add Payment Items
        </h2>

        <div className="space-y-3">
          {inputs.map((val, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`e.g. ${["Uniform", "Stationeries", "Sports Wear", "Excursion"][index] ?? "Payment item"}`}
                value={val}
                onChange={(e) => handleChange(index, e.target.value)}
                className="rounded-xl border-gray-200"
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-gray-400 hover:text-red-500"
                onClick={() => handleRemoveInput(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-gray-200 text-sm"
            onClick={handleAddMore}
          >
            <Plus className="size-4" />
            Add More
          </Button>
          <Button
            className="gap-2 rounded-xl bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={isCreating}
          >
            {isCreating && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      {/* Saved items list */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-12">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : (
        paymentItems.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white ">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Saved Payment Items 
              </h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {paymentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-6 py-3.5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Tag className="size-4 text-blue-600" />
                    </div>
                    {editingId === item.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") cancelEdit()
                        }}
                        autoFocus
                        className="h-9 rounded-lg border-gray-200 text-sm"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {editingId === item.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-green-600"
                        onClick={saveEdit}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        onClick={cancelEdit}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-gray-400 hover:text-blue-600"
                      onClick={() => startEdit(item.id, item.name)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  )
}
