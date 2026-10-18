import { isStrict } from '../config/edition'

export interface Finding {
  rule: string
  where: string
  detail: string
}

/** Collects build-check findings; strict mode (CI) turns them into a failed build. */
export class Report {
  private findings: Finding[] = []

  add(rule: string, where: string, detail = ''): void {
    this.findings.push({ rule, where, detail })
  }

  get count(): number {
    return this.findings.length
  }

  /** Print a grouped summary; throw in strict mode when anything was found. */
  finish(): void {
    if (this.findings.length === 0) {
      console.log('[docs-checks] OK: no findings')
      return
    }
    const byRule = new Map<string, Finding[]>()
    for (const f of this.findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f])
    const level = isStrict ? 'ERROR' : 'WARN'
    console.warn(`\n[docs-checks] ${this.findings.length} finding(s) (${level}${isStrict ? '' : ', set DOCS_STRICT=1 to fail the build'}):`)
    // DOCS_CHECKS_VERBOSE=1 lists every finding (release gate reports).
    const limit = process.env.DOCS_CHECKS_VERBOSE === '1' ? Infinity : 8
    for (const [rule, list] of [...byRule].sort((a, b) => a[0].localeCompare(b[0]))) {
      console.warn(`  ${rule} (${list.length})`)
      for (const f of list.slice(0, limit)) console.warn(`    - ${f.where}${f.detail ? `: ${f.detail}` : ''}`)
      if (list.length > limit) console.warn(`    … ${list.length - limit} more`)
    }
    if (isStrict) throw new Error(`[docs-checks] ${this.findings.length} finding(s) in strict mode`)
  }
}
