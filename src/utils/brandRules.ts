export interface BrandRuleViolation {
  rule: string
  message: string
  severity: 'warning' | 'error'
}

export const validateBrandRules = (caption: string): BrandRuleViolation[] => {
  const violations: BrandRuleViolation[] = []
  
  // Check for exclamation marks
  if (caption.includes('!')) {
    violations.push({
      rule: 'No exclamation marks',
      message: 'Brand rule: No exclamation marks',
      severity: 'error'
    })
  }
  
  // Check for "journey"
  if (caption.toLowerCase().includes('journey')) {
    violations.push({
      rule: 'No journey',
      message: "Brand rule: Never use 'journey'",
      severity: 'error'
    })
  }
  
  // Check for "free" as primary CTA
  if (caption.toLowerCase().includes('free')) {
    violations.push({
      rule: 'Avoid free',
      message: "Brand rule: Avoid 'free' as primary CTA — phase out",
      severity: 'warning'
    })
  }
  
  // Check for caption structure (soft reminder)
  const hasStructure = checkCaptionStructure(caption)
  if (!hasStructure) {
    violations.push({
      rule: 'Caption structure',
      message: 'Soft reminder: Follow Pain → Agitation → Solution → Proof → CTA structure',
      severity: 'warning'
    })
  }
  
  return violations
}

const checkCaptionStructure = (caption: string): boolean => {
  // This is a simple heuristic check
  // A proper caption should have at least 3 lines and some key elements
  const lines = caption.split('\n').filter(l => l.trim().length > 0)
  
  // Check for common pain question starters
  const painStarters = ['is', 'does', 'can', 'why', 'how', 'what', 'your', 'your child']
  const hasPain = lines.length > 0 && painStarters.some(starter => 
    lines[0].toLowerCase().startsWith(starter)
  )
  
  // Check for CTA elements
  const ctaKeywords = ['book', 'join', 'enroll', 'audition', 'trial', 'class', 'contact', 'whatsapp', 'dm']
  const hasCTA = caption.toLowerCase().split(' ').some(word => 
    ctaKeywords.some(cta => word.includes(cta))
  )
  
  return lines.length >= 3 && (hasPain || hasCTA)
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Scheduled':
      return 'bg-gray-200 text-gray-800'
    case 'Posted':
      return 'bg-green-200 text-green-800'
    case 'Held':
      return 'bg-amber-200 text-amber-800'
    case 'Rescheduled':
      return 'bg-blue-200 text-blue-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

export const getKPIStatusColor = (current: number, target: number): string => {
  const percentage = (current / target) * 100
  
  if (percentage >= 100) {
    return 'bg-green-100 border-green-500'
  } else if (percentage >= 80) {
    return 'bg-amber-100 border-amber-500'
  } else {
    return 'bg-red-100 border-red-500'
  }
}

export const getKPIStatusIndicator = (current: number, target: number): 'green' | 'amber' | 'red' => {
  const percentage = (current / target) * 100
  
  if (percentage >= 100) {
    return 'green'
  } else if (percentage >= 80) {
    return 'amber'
  } else {
    return 'red'
  }
}
