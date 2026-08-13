import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages — implemented fully in Phase 4/5
// Placeholder shells during Phase 2 so the router tree is in place
function Dashboard()   { return <div className="p-8 text-slate-600">Dashboard — Phase 5</div> }
function Performance() { return <div className="p-8 text-slate-600">Performance — Phase 5</div> }
function Products()    { return <div className="p-8 text-slate-600">Products — Phase 5</div> }
function Orders()      { return <div className="p-8 text-slate-600">Orders — Phase 5</div> }
function Reports()     { return <div className="p-8 text-slate-600">Reports — Phase 6</div> }

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        {/* TopNavBar added in Phase 4 */}
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/products"    element={<Products />} />
          <Route path="/orders"      element={<Orders />} />
          <Route path="/reports"     element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
