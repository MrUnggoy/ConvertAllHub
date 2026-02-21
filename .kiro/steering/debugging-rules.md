# CRITICAL DEBUGGING RULES - READ THIS EVERY TIME

## ⚠️ MANDATORY DEBUGGING APPROACH ⚠️

**WHEN SOMETHING BREAKS:**

1. **REVERT FIRST** - Always go back to the last working state
2. **DO NOT** keep trying different approaches 
3. **DO NOT** add more complexity when debugging
4. **DO NOT** keep changing things hoping it will work
5. **REVERT TO WORKING STATE IMMEDIATELY**

## What NOT to do:
- ❌ Try multiple different "fixes" 
- ❌ Add new components while debugging
- ❌ Keep modifying broken code
- ❌ Make the problem more complex

## What TO do:
- ✅ **REVERT to last working state**
- ✅ Ask user to confirm it's working
- ✅ Then make ONE small change at a time
- ✅ Test after each small change

## Remember:
**IF IT WAS WORKING BEFORE, GO BACK TO THAT EXACT STATE**

**STOP TRYING TO BE CLEVER - JUST REVERT**

---

## 🚨 WHITE SCREEN DEBUG CHECKLIST 🚨

**When React app shows white screen:**

1. **Start with MINIMAL working App.tsx** - Use inline styles, no imports
2. **Check TypeScript compilation errors** - Run `npx tsc --noEmit`
3. **Missing components cause white screen** - Create placeholder components
4. **Check browser console** - Look for actual error messages
5. **Build up incrementally** - Add one component at a time

**Common causes of white screen:**
- Missing component imports (AdZone, UsageDashboard, etc.)
- TypeScript compilation errors blocking build
- Missing hooks (useAnalytics, useResponsive, etc.)
- Missing UI components (Progress, Card, Button, etc.)

**Fix pattern:**
1. Simplify App.tsx to basic div with inline styles
2. Confirm it renders
3. Add back complexity ONE piece at a time
4. Create missing components as simple placeholders first

---
*This rule was created because Kiro kept making debugging more complex instead of simply reverting to working code.*