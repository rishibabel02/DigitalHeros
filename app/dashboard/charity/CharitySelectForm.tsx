'use client'

export default function CharitySelectForm({
  charities,
  currentCharityId,
  currentPct,
}: {
  charities: any[]
  currentCharityId?: string
  currentPct?: number
}) {
  return (
    <form action="/api/charity/select" method="POST" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
      <div>
        <label className="label">Charity</label>
        <select id="charity-select" name="charityId" className="input" defaultValue={currentCharityId}>
          {charities.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Contribution % (min 10%)</label>
        <input id="contribution-pct" className="input" type="number" name="percentage" min={10} max={100} defaultValue={currentPct || 10} />
      </div>
      <button id="save-charity-btn" className="btn btn-primary" type="submit">Save</button>
    </form>
  )
}
