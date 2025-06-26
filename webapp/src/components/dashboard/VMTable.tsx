import { Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

type VM = {
  id: number;
  name: string;
  state: string;
  cpu_usage: string;
  memory_assigned_gb: number;
  memory_demand_gb: number;
  backup_alert: string;
};

type Props = {
  vms: VM[];
  hvIp: string;
};

export default function VMTable({ vms, hvIp }: Props) {
  const handleAction = (vmName: string, action: 'start' | 'stop' | 'restart') => {
    fetch(`http://localhost:5000/vm/${hvIp}/${vmName}/${action}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        alert(`${action.toUpperCase()} → ${data.message}`);
      })
      .catch(() => alert('⚠️ Failed to perform action.'));
  };

  const stateBadge = (state: string) => {
    const normalized = state.toLowerCase();
    const isRunning = normalized === 'running';
    return (
      <span
        className={clsx(
          'text-xs px-2 py-0.5 rounded-full font-semibold',
          isRunning
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        )}
      >
        {isRunning ? 'Active' : 'Stopped'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-slate-50 border-b text-slate-500 text-sm">
          <tr>
            <th className="p-3 text-left">VM Name</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">CPU</th>
            <th className="p-3 text-left">Memory</th>
            <th className="p-3 text-left">Backup</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-700">
          {vms.map((vm) => (
            <tr key={vm.id} className="border-b hover:bg-slate-50 transition">
              <td className="p-3 font-medium">{vm.name}</td>
              <td className="p-3">{stateBadge(vm.state)}</td>
              <td className="p-3">{vm.cpu_usage}</td>
              <td className="p-3">{vm.memory_assigned_gb} / {vm.memory_demand_gb} GB</td>
              <td className="p-3 text-yellow-700">{vm.backup_alert}</td>
              <td className="p-3 flex gap-2 items-center">
                <button
                  onClick={() => handleAction(vm.name, 'start')}
                  title="Start"
                  className="p-1 rounded hover:bg-green-100 text-green-600"
                >
                  <Play size={16} />
                </button>
                <button
                  onClick={() => handleAction(vm.name, 'stop')}
                  title="Stop"
                  className="p-1 rounded hover:bg-red-100 text-red-600"
                >
                  <Pause size={16} />
                </button>
                <button
                  onClick={() => handleAction(vm.name, 'restart')}
                  title="Restart"
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                >
                  <RotateCcw size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
