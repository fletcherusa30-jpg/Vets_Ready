import { useState } from "react"
import { translateMOS } from "../services/mosTranslator"
import { MOSTranslation } from "../types"

export function MOSTranslator() {
  const [mosCode, setMosCode] = useState("")
  const [translation, setTranslation] = useState<MOSTranslation | null>(null)

  const handleTranslate = () => {
    const result = translateMOS(mosCode)
    setTranslation(result)
  }

  return (
    <div className="mos-translator">
      <h2>MOS to Civilian Translator</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter MOS code (e.g., 11B, 25B, 68W)"
          value={mosCode}
          onChange={(e) => setMosCode(e.target.value.toUpperCase())}
        />
        <button onClick={handleTranslate}>Translate</button>
      </div>

      {translation && (
        <div className="translation-result">
          <h3>{translation.mosTitle}</h3>
          <p>{translation.description}</p>

          <section>
            <h4>Civilian Roles</h4>
            <ul>
              {translation.civilianRoles.map((role, idx) => (
                <li key={idx}>{role}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Recommended Certifications</h4>
            <ul>
              {translation.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Career Paths</h4>
            <ul>
              {translation.careerPaths.map((path, idx) => (
                <li key={idx}>{path}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
