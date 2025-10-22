import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format, startOfToday } from "date-fns";
import type { FC } from "react";
import { db } from "@/lib/db";

// Zod schema for validating individual date fields.
// Cross-field validation is handled by the form logic itself.
const PastCycleFieldSchema = z
  .string()
  .refine(val => val && !isNaN(Date.parse(val)), {
    message: "Please select a valid date.",
  })
  .refine(val => new Date(val) <= startOfToday(), {
    message: "Date cannot be in the future.",
  });

interface PastCycle {
  startDate: string;
  endDate: string;
}

/**
 * A custom hook that provides a mutation function to add a new past cycle record to the database.
 * It handles invalidation of relevant queries to ensure the UI is updated on success.
 *
 * @returns A TanStack Query mutation object.
 */
const useAddPastCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCycle: PastCycle) => {
      // Convert string dates from the form into Date objects for the database
      return db.cycles.add({
        startDate: new Date(newCycle.startDate),
        endDate: new Date(newCycle.endDate),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the cycles query to update lists and calendars
      return queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
    onError: error => {
      // TODO: Replace with a user-facing notification (e.g., a toast)
      console.error("Failed to add past cycle:", error);
    },
  });
};

interface LogPastPeriodFormProps {
  /** Callback executed when the form is successfully submitted. */
  onSuccess: () => void;
  /** Callback executed when the user cancels the form. */
  onCancel: () => void;
}

/**
 * A form component for logging a past period cycle. It includes date pickers
 * for start and end dates and performs validation before submission.
 */
export const LogPastPeriodForm: FC<LogPastPeriodFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const addPastCycleMutation = useAddPastCycle();

  const form = useForm({
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    },
    onSubmit: ({ value }) => {
      addPastCycleMutation.mutate(value, {
        onSuccess: () => {
          onSuccess(); // Trigger the callback from props on successful mutation
        },
      });
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="startDate"
        validators={{
          onChange: PastCycleFieldSchema,
        }}
      >
        {field => (
          <div className="form-control">
            <label className="label" htmlFor={field.name}>
              <span className="label-text">Start Date</span>
            </label>
            <input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="input input-bordered"
            />
            {field.state.meta.errors.length > 0 ? (
              <em className="text-error text-sm mt-1">
                {field.state.meta.errors.join(", ")}
              </em>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="endDate"
        validators={{
          onChange: PastCycleFieldSchema,
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: ({ value, fieldApi }) => {
            // This validation runs after the synchronous `onChange` validation.
            // It ensures the end date is not before the start date.
            const startDate = fieldApi.form.getFieldValue("startDate");
            if (new Date(value) < new Date(startDate)) {
              return "End date cannot be before the start date.";
            }
            return null; // Return null if validation passes
          },
        }}
      >
        {field => (
          <div className="form-control">
            <label className="label" htmlFor={field.name}>
              <span className="label-text">End Date</span>
            </label>
            <input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              className="input input-bordered"
            />
            {field.state.meta.errors.length > 0 ? (
              <em className="text-error text-sm mt-1">
                {field.state.meta.errors.join(", ")}
              </em>
            ) : null}
          </div>
        )}
      </form.Field>

      <div className="modal-action mt-6">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <form.Subscribe
          selector={state => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
