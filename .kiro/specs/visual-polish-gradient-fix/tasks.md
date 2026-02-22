# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Dynamic Gradient Class Construction Bug
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test the specific case where HeroSection uses dynamic gradient classes
  - Test that HeroSection with gradient prop `{ from: 'blue-600', to: 'purple-600' }` fails to render visible gradient
  - Verify computed styles show no background-image gradient property
  - Verify that dynamically constructed classes like `from-blue-600` have no CSS rules applied
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Gradient Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-gradient functionality
  - Test text content (title and tagline) renders correctly
  - Test decorative blur circles render with correct positioning
  - Test className prop merges additional classes correctly
  - Test responsive behavior works on different viewport sizes
  - Test dark mode compatibility is maintained
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix gradient rendering in HeroSection component

  - [x] 3.1 Implement the gradient fix using inline styles
    - Replace dynamic Tailwind class construction with inline CSS gradient
    - Use `backgroundImage: 'linear-gradient(to right, rgb(37 99 235), rgb(147 51 234))'` for blue-to-purple gradient
    - Apply inline style to the main container div
    - Remove or simplify gradient prop interface if no longer needed
    - Ensure gradient is visually striking and immediately noticeable
    - _Bug_Condition: isBugCondition(input) where input.gradient uses template literal interpolation_
    - _Expected_Behavior: Gradient renders correctly using inline styles or static classes_
    - _Preservation: All non-gradient functionality (text, decorative elements, responsive, dark mode, animations, className merging) remains unchanged_
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Gradient Renders Correctly
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Gradient Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Verify all exploration and preservation tests pass
  - Manually inspect HeroSection on homepage to confirm gradient is visible
  - Check gradient appearance in both light and dark modes
  - Test responsive behavior on mobile, tablet, and desktop viewports
  - Ask the user if questions arise
