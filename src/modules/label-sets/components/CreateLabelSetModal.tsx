import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/input/Textarea'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-areas/ScrollArea'
import type { Label as LabelType } from '~/modules/label-sets'

type LabelDraft = Omit<LabelType, 'id'> & { key: string }

const createLabelDraft = (): LabelDraft => ({
  key: globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
  name: '',
  color: '#3B82F6',
})

export interface CreateLabelSetFormData {
  name: string
  description: string
  labels: Omit<LabelType, 'id'>[]
}

export interface CreateLabelSetModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateLabelSetFormData) => void
}

export function CreateLabelSetModal({
  open,
  onClose,
  onSubmit,
}: CreateLabelSetModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState<LabelDraft[]>(() => [createLabelDraft()])
  const [errors, setErrors] = useState<{
    name?: string
  }>({})

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setLabels([createLabelDraft()])
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = t('labelSets.create.validation.nameRequired')
    } else if (name.trim().length < 2) {
      newErrors.name = t('labelSets.create.validation.nameMin')
    } else if (name.trim().length > 64) {
      newErrors.name = t('labelSets.create.validation.nameMax')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const validLabels = labels
      .filter((l) => l.name.trim())
      .map((l) => ({
        name: l.name.trim(),
        description: l.description?.trim() || undefined,
        color: l.color || undefined,
      }))

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      labels: validLabels,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const addLabel = () => {
    setLabels([...labels, createLabelDraft()])
  }

  const removeLabel = (key: string) => {
    setLabels(labels.filter((label) => label.key !== key))
  }

  const updateLabel = (
    key: string,
    updates: Partial<Omit<LabelType, 'id'>>,
  ) => {
    setLabels(
      labels.map((label) =>
        label.key === key ? { ...label, ...updates } : label,
      ),
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className="max-w-2xl h-[90vh] flex flex-col p-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="shrink-0">
          <DialogHeader>
            <DialogTitle>{t('labelSets.create.title')}</DialogTitle>
            <DialogDescription>
              {t('labelSets.create.description')}
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea rootClassName="flex-1 min-h-0">
          <div className="space-y-4 py-2 pr-2">
            {/* Name Field */}
            <div className="space-y-6">
              <Label htmlFor="label-set-name">
                {t('labelSets.create.fields.name')}{' '}
                <span className="text-red">*</span>
              </Label>
              <Input
                id="label-set-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }))
                  }
                }}
                placeholder={t('labelSets.create.placeholders.name')}
                maxLength={64}
                hasError={!!errors.name}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name ? (
                <p id="name-error" className="text-sm text-red">
                  {errors.name}
                </p>
              ) : (
                <p className="text-xs text-text-tertiary">
                  {t('labelSets.create.hints.name')}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="label-set-description">
                {t('labelSets.create.fields.description')}
              </Label>
              <Textarea
                id="label-set-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('labelSets.create.placeholders.description')}
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-tertiary">
                  {t('labelSets.create.hints.description')}
                </p>
                <p className="text-xs text-text-tertiary">
                  {description.length}/500
                </p>
              </div>
            </div>

            {/* Labels Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('labelSets.create.fields.labelsOptional')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLabel}
                  className="h-8"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('labelSets.create.actions.addLabel')}
                </Button>
              </div>

              <p className="text-xs text-text-tertiary">
                {t('labelSets.create.hints.labels')}
              </p>

              <div className="space-y-3 rounded-2xl border border-border bg-fill/30 p-4">
                {labels.map((label) => (
                  <div
                    key={label.key}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label
                            htmlFor={`label-${label.key}-name`}
                            className="text-xs"
                          >
                            {t('labelSets.create.fields.labelName')}
                          </Label>
                          <Input
                            id={`label-${label.key}-name`}
                            value={label.name}
                            onChange={(e) =>
                              updateLabel(label.key, { name: e.target.value })
                            }
                            placeholder={t(
                              'labelSets.create.placeholders.labelName',
                            )}
                            className="mt-1"
                          />
                        </div>
                        <div className="w-24">
                          <Label
                            htmlFor={`label-${label.key}-color`}
                            className="text-xs"
                          >
                            {t('labelSets.create.fields.color')}
                          </Label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              id={`label-${label.key}-color`}
                              type="color"
                              value={label.color || '#3B82F6'}
                              onChange={(e) =>
                                updateLabel(label.key, {
                                  color: e.target.value,
                                })
                              }
                              className="h-9 w-16 cursor-pointer rounded-lg border border-border"
                            />
                          </div>
                        </div>
                        {labels.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLabel(label.key)}
                            className="mt-6 h-9 w-9 p-0 text-red hover:text-red hover:bg-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`label-${label.key}-description`}
                          className="text-xs"
                        >
                          {t('labelSets.create.fields.labelDescription')}
                        </Label>
                        <Input
                          id={`label-${label.key}-description`}
                          value={label.description || ''}
                          onChange={(e) =>
                            updateLabel(label.key, {
                              description: e.target.value,
                            })
                          }
                          placeholder={t(
                            'labelSets.create.placeholders.labelDescription',
                          )}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="shrink-0 bg-background">
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              {t('labelSets.create.actions.create')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
