import { useMqttOutputs } from "../../plants/hooks/useMqttOutputs";

type HeaderCardProps = {
  cardBg: string
  border: string
  primary: string
  isLandscape: boolean
  Line1: number
  Line3: number
  Line4: number
  Line5: number
  Line6: number
  Line7: number
  Line8: number
  Line9: number
  Line10: number
  Line11: number
  
}

export function HeaderCard2({
  cardBg,
  border,
  primary,
  isLandscape,
  Line1,
  Line3,
  Line4,
  Line5,
  Line6,
  Line7,
  Line8,
  Line9,
  Line10,
  Line11,

}: HeaderCardProps) {
  return (
    <div
      className="rounded-2xl border p-4 mx-auto"
      style={{
        background: cardBg,
        borderColor: border,
        width: isLandscape ? 600 : "100%",
      }}
    >
      {/* TITLE */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-white/65 mt-1">
            Machine Live Speed 
          </div>
        </div>
      </div>

      {/* LINE 1 */}
      <div className="mt-2 h-px bg-white/10" />

      {/* STATS 1 */}
      <div className="mt-3 flex flex-wrap gap-4">

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 1</div>
          <div className={`font-extrabold text-xl ${Line1 < 50 ? "text-red-500" : "text-green-500"}`} >{Line1} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 6</div>
          <div className={`font-extrabold text-xl ${Line6 < 50 ? "text-red-500" : "text-green-500"}`} >{Line6} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 11</div>
          <div className={`font-extrabold text-xl ${Line11 < 50 ? "text-red-500" : "text-green-500"}`} >{Line11} </div>
        </div>

      </div>


      {/* LINE 2*/}
      <div className="mt-2 h-px bg-white/10" />

      {/* STATS 2 */}

      <div className="mt-3 flex flex-wrap gap-4">

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 3</div>
          <div className={`font-extrabold text-xl ${Line3 < 50 ? "text-red-500" : "text-green-500"}`} >{Line3} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 4</div>
          <div className={`font-extrabold text-xl ${Line4 < 50 ? "text-red-500" : "text-green-500"}`} >{Line4} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 5</div>
          <div className={`font-extrabold text-xl ${Line5 < 50 ? "text-red-500" : "text-green-500"}`} >{Line5} </div>
        </div>

      </div>
      

        {/* LINE 3 */}
      <div className="mt-2 h-px bg-white/10" />

      {/* STATS 3 */}

      <div className="mt-3 flex flex-wrap gap-4">

      <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 7</div>
          <div className={`font-extrabold text-xl ${Line7 < 50 ? "text-red-500" : "text-green-500"}`} >{Line7} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 8</div>
          <div className={`font-extrabold text-xl ${Line8 < 50 ? "text-red-500" : "text-green-500"}`} >{Line8} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 9</div>
          <div className={`font-extrabold text-xl ${Line9 < 50 ? "text-red-500" : "text-green-500"}`} >{Line9} </div>
        </div>

        <div className="bg-[#0b1626] border border-white/10 rounded-xl px-2 py-2 w-full sm:w-[150px] flex-1">
          <div className="text-white/60 text-xs">Mesin 10</div>
          <div className={`font-extrabold text-xl ${Line10 < 50 ? "text-red-500" : "text-green-500"}`} >{Line10} </div>
        </div>

        </div>

      </div>
    
  )
}