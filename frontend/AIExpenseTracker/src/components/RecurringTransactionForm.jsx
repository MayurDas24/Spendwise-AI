import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    Repeat,
    Calendar,
    Wallet,
    BadgeIndianRupee,
} from 'lucide-react';

import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';

import Input from './ui/Input.jsx';
import Select from './ui/Select.jsx';
import Button from './ui/Button.jsx';

const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annually', label: 'Semi Annually' },
    { value: 'yearly', label: 'Yearly' },
];

const RecurringTransactionForm = ({
    categories = [],
    onSaved,
    onCancel,
}) => {
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        type: 'expense',
        categoryId: '',
        amount: '',
        title: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
    });

    // =========================================
    // FILTER CATEGORIES BASED ON TYPE
    // =========================================

    const filteredCategories = categories.filter(
        (c) => c.type === form.type
    );

    // =========================================
    // AUTO TITLE PLACEHOLDER
    // =========================================

    const placeholder =
        form.type === 'income'
            ? 'Monthly Salary'
            : 'Netflix Subscription';

    // =========================================
    // SUBMIT
    // =========================================

    const submit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            await api.post(
                API_PATHS.TRANSACTIONS.RECURRING_CREATE,
                form
            );

            toast.success('Recurring transaction created');

            onSaved();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    'Failed to create recurring transaction'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-5"
        >
            {/* ========================================= */}
            {/* TYPE TOGGLE */}
            {/* ========================================= */}

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() =>
                        setForm({
                            ...form,
                            type: 'expense',
                        })
                    }
                    className={`py-3 rounded-2xl font-semibold transition-all
                    ${
                        form.type === 'expense'
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    Expense
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setForm({
                            ...form,
                            type: 'income',
                        })
                    }
                    className={`py-3 rounded-2xl font-semibold transition-all
                    ${
                        form.type === 'income'
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    Income
                </button>
            </div>

            {/* ========================================= */}
            {/* TITLE */}
            {/* ========================================= */}

            <Input
                label="Recurring Title"
                placeholder={placeholder}
                value={form.title}
                onChange={(e) =>
                    setForm({
                        ...form,
                        title: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />

            {/* ========================================= */}
            {/* AMOUNT */}
            {/* ========================================= */}

            <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                    setForm({
                        ...form,
                        amount: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />

            {/* ========================================= */}
            {/* CATEGORY */}
            {/* ========================================= */}

            <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) =>
                    setForm({
                        ...form,
                        categoryId: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            >
                <option value="">
                    Select category
                </option>

                {filteredCategories.map((cat) => (
                    <option
                        key={cat.id}
                        value={cat.id}
                    >
                        {cat.name}
                    </option>
                ))}
            </Select>

            {/* ========================================= */}
            {/* FREQUENCY */}
            {/* ========================================= */}

            <Select
                label="Frequency"
                value={form.frequency}
                onChange={(e) =>
                    setForm({
                        ...form,
                        frequency: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            >
                {frequencies.map((freq) => (
                    <option
                        key={freq.value}
                        value={freq.value}
                    >
                        {freq.label}
                    </option>
                ))}
            </Select>

            {/* ========================================= */}
            {/* START DATE */}
            {/* ========================================= */}

            <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                    setForm({
                        ...form,
                        startDate: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />

            {/* ========================================= */}
            {/* DESCRIPTION */}
            {/* ========================================= */}

            <Input
                label="Description"
                placeholder={
                    form.type === 'income'
                        ? 'Primary monthly income'
                        : 'Auto deducted every month'
                }
                value={form.description}
                onChange={(e) =>
                    setForm({
                        ...form,
                        description: e.target.value,
                    })
                }
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />

            {/* ========================================= */}
            {/* PREVIEW CARD */}
            {/* ========================================= */}

            <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 p-4">
                <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-violet-500 text-white flex items-center justify-center shrink-0">
                        <Repeat size={20} />
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Recurring Preview
                        </h3>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            ₹
                            {form.amount || '0'} will repeat{' '}
                            <span className="font-medium">
                                {form.frequency}
                            </span>
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Starting from {form.startDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* ACTIONS */}
            {/* ========================================= */}

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="dark:border-slate-700 dark:text-slate-200"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? 'Creating...'
                        : 'Create Recurring'}
                </Button>
            </div>
        </form>
    );
};

export default RecurringTransactionForm;