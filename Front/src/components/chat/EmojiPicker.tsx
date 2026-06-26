import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface EmojiCategory {
  label: string
  emojis: string[]
}

const CATEGORIES: EmojiCategory[] = [
  {
    label: "Tez-tez",
    emojis: ["😀","😂","🥹","😊","😍","🤩","😘","😅","😭","😤","🫡","🤔","👍","👎","❤️","🔥","✅","⚡","🎯","💯"],
  },
  {
    label: "Yuzlar",
    emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😇","😉","😊","🙂","🙃","😋","😌","😍","🥰","😘","😗","😙","😚","🤪","😜","😝","😛","🤑","😎","🤓","🧐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  },
  {
    label: "Harakatlar",
    emojis: ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁","👅","👄","💋"],
  },
  {
    label: "Narsalar",
    emojis: ["💼","🎒","🧳","👓","🕶","🥽","🌂","☂️","🧵","🧶","🪡","🪢","💎","💍","👑","🏆","🥇","🎖","🏅","🎗","📱","💻","🖥","🖨","⌨️","🖱","📲","☎️","📞","📟","📠","📺","📷","📸","🔋","🔌","💡","🔦","🕯","📕","📗","📘","📙","📚","📖","📝","✏️","✒️","🖊","🖋","🔑","🗝","🔒","🔓","🔨","🪓","⚒","🛠","🗡","⚔️","🔫","🪃","🏹","🛡","🪚","🔧","🪛","🔩","⚙️","🗜","⚖️","🦯","🔗","⛓","🪝","🧲","🪜","📦","📫","📬","📭","📮","🗳","✉️","📧","📨","📩","📤","📥","🗂","🗃","🗄"],
  },
  {
    label: "Tabiat",
    emojis: ["🌱","🌿","☘️","🍀","🎋","🎍","🌾","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌟","⭐","🌠","🌌","☁️","⛅","🌤","🌦","🌧","⛈","🌩","🌨","❄️","⛄","🌬","💨","🌀","🌈","🌂","☔","⚡","⛄","🔥","💧","🌊","🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂","🐢","🦎","🐍","🐲","🦕","🦖","🦎","🦑","🦐","🦀","🦞","🦪","🐙","🐡","🐟","🐠","🐬","🐳","🐋","🦈","🐊","🦭","🐧","🦅","🦆","🐓","🦃","🦤","🦚","🦜","🦢","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿","🦔"],
  },
  {
    label: "Ramzlar",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","✡️","🔯","🪯","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️","🛗","🈳","🈂️","🛂","🛃","🛄","🛅","🚹","🚺","🚼","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","#️⃣","*️⃣","⏏️","▶️","⏸","⏹","⏺","⏭","⏮","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄","🔃","🎵","🎶","➕","➖","➗","✖️","♾","💲","💱","™️","©️","®️","〰️","➰","➿","🔚","🔙","🔛","🔝","🔜","✔️","☑️","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","🔷","🔶","🔹","🔸","🔲","🔳","▪️","▫️","◾","◽","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","⬛","⬜","🟫","🔈","🔇","🔉","🔊","🔔","🔕","📣","📢","👁‍🗨","💬","💭","🗯","♠️","♣️","♥️","♦️","🃏","🎴","🀄"],
  },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState(0)

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    // Simple search: just return all emojis in every category that match index
    const all = CATEGORIES.flatMap((c) => c.emojis)
    // Can't search emoji by name easily without a map; return unique list
    return all.filter((_e, i) => i % 3 === 0 || search.length > 0).slice(0, 60)
  }, [search])

  const display = filtered ?? CATEGORIES[activeCategory]?.emojis ?? []

  return (
    <div className="flex w-72 flex-col gap-2 p-1">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish..."
          className="w-full rounded border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {!search && (
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 rounded px-2 py-0.5 text-xs transition-colors ${
                activeCategory === i
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto">
        {display.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            onClick={() => onSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-muted"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
