import { useGameStore } from "../../store/useGameStore";

export function InventoryPanel(): JSX.Element {
  const { snapshot, sendAction } = useGameStore();
  if (!snapshot) {
    return <section className="panel p-4">No inventory data.</section>;
  }
  return (
    <section className="panel p-4">
      <h3 className="mb-3 text-lg font-semibold">Inventory</h3>
      <div className="space-y-2">
        {snapshot.inventory.carried.map((item) => (
          <div key={item.item_id} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <span className="text-sm">
              {item.name} x{item.qty}
            </span>
            <button
              className="rounded bg-cyan-500/20 px-2 py-1 text-xs"
              onClick={() => void sendAction({ type: "USE_ITEM", payload: { item_id: item.item_id } })}
            >
              Use
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-cyan-100/70">
        Weight {snapshot.inventory.weight.current}/{snapshot.inventory.weight.capacity}
      </p>
    </section>
  );
}
