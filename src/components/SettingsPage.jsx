import { exportWorkspace, formatCurrency, formatCurrencyPrecise } from '../data/householdModel'
import { Panel } from '../ui/Panel'

export function SettingsPage({ workspace, syncState, members, user, onSignOut, onResetDemo, onExport, cloudEnabled }) {
  const activeUsers = members.length
  const totalTracked = workspace.accounts.length + workspace.cashFlowEntries.length + workspace.plannerGoals.length
  const exportData = () => {
    const payload = exportWorkspace(workspace)
    onExport(payload)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Workspace Settings</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Household Settings & Sync</h2>
        <p className="mt-3 max-w-3xl text-slate-400">Manage the shared household identity, connected members, cloud status, export flow, and demo reset controls without leaving the premium WealthOS shell.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Household name" value={workspace.household.name} />
        <MetricCard label="Active users" value={String(activeUsers)} />
        <MetricCard label="Sync mode" value={cloudEnabled ? 'Cloud + local' : 'Local only'} />
        <MetricCard label="Tracked records" value={String(totalTracked)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Panel>
          <h3 className="text-2xl font-semibold text-white">Household profile</h3>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <InfoRow label="Household slug" value={workspace.household.slug} />
            <InfoRow label="Signed-in user" value={user?.email ?? 'Local device'} />
            <InfoRow label="Owner profiles" value={workspace.household.owners.map((owner) => owner.name).join(' · ')} />
            <InfoRow label="Last local save" value={syncState.lastSavedLabel} />
            <InfoRow label="Last cloud sync" value={syncState.lastSyncedLabel} />
            <InfoRow label="Sync status" value={syncState.label} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-2xl font-semibold text-white">Active users</h3>
          <div className="mt-6 space-y-3">
            {members.length ? members.map((member) => (
              <div key={member.user_id || member.email} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{member.display_name || member.email}</p>
                    <p className="mt-1 text-sm text-slate-400">{member.owner_label} · {member.email}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">{member.last_seen_at ? 'Seen' : 'Pending'}</span>
                </div>
              </div>
            )) : (
              <p className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">No cloud members yet. Configure Supabase and sign in to enable the shared roster.</p>
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <h3 className="text-2xl font-semibold text-white">Data controls</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionButton title="Export data" detail="Download the full workspace JSON for backups or migrations." onClick={exportData} />
          <ActionButton title="Reset demo data" detail="Replace the current workspace with the WealthOS starter household." onClick={onResetDemo} />
          <ActionButton title="Sign out" detail="Clear the saved session on this device while keeping local cache." onClick={onSignOut} />
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Sync summary</p>
            <p className="mt-2">Net worth {formatCurrency(workspace.accounts.reduce((sum, account) => sum + Number(account.balance), 0))} · Income {formatCurrencyPrecise(workspace.accounts.reduce((sum, account) => sum + account.holdings.reduce((holdingSum, holding) => holdingSum + Number(holding.estimatedMonthlyIncome || 0), 0), 0))}/mo</p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

function ActionButton({ title, detail, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-left transition hover:border-brand-400/40 hover:bg-brand-500/5">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </button>
  )
}
