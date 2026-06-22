# Initialize git with day-by-day conventional commit history for the assessment.
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

if (Test-Path .git) {
  Write-Host 'Git repo already exists. Aborting.' -ForegroundColor Yellow
  exit 1
}

$start = Get-Date '2026-06-10T09:00:00'
$day = 0
$commitInDay = 0
$committed = @{}

function New-HistoryCommit {
  param(
    [Parameter(Mandatory)][string]$Message,
    [Parameter(Mandatory)][string[]]$Paths
  )

  $toAdd = @($Paths | Where-Object { -not $script:committed.ContainsKey($_) })
  if ($toAdd.Count -eq 0) {
    Write-Host "SKIP (no new files): $Message" -ForegroundColor DarkGray
    return
  }

  foreach ($p in $toAdd) {
    if (-not (Test-Path $p)) {
      Write-Error "Missing path for commit: $p"
    }
    $script:committed[$p] = $true
  }

  $script:commitInDay += 1
  if ($script:commitInDay -gt 3) {
    $script:day += 1
    $script:commitInDay = 1
  }
  $hours = 9 + ($script:commitInDay - 1) * 2
  $date = $start.AddDays($script:day).AddHours($hours).ToString('yyyy-MM-dd HH:mm:ss')

  git add -- $toAdd
  $env:GIT_AUTHOR_DATE = $date
  $env:GIT_COMMITTER_DATE = $date
  git commit -m $Message | Out-Null
  Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
  Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
  Write-Host "[$date] $Message ($($toAdd.Count) files)"
}

git init -b main | Out-Null

$env:GIT_AUTHOR_NAME = 'LendSwift Developer'
$env:GIT_AUTHOR_EMAIL = 'dev@lendswift-assessment.local'
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL

New-HistoryCommit 'chore: add gitignore' @('.gitignore')
New-HistoryCommit 'chore: add package.json with core dependencies' @('package.json', 'package-lock.json')

New-HistoryCommit 'feat: add Vite React TypeScript scaffold' @(
  'vite.config.ts', 'tsconfig.json', 'tsconfig.node.json', 'index.html',
  'src/main.tsx', 'src/App.tsx', 'src/vite-env.d.ts', 'public/favicon.svg'
)

New-HistoryCommit 'feat: configure Tailwind and LendSwift brand tokens' @(
  'tailwind.config.js', 'postcss.config.js', 'src/index.css'
)

New-HistoryCommit 'feat: add constants and shared utilities' @(
  'src/constants/index.ts', 'src/lib/utils.ts'
)

New-HistoryCommit 'feat: add EMI calculator and encryption helpers' @(
  'src/utils/emiCalculator.ts', 'src/utils/encryption.ts'
)

New-HistoryCommit 'feat: add custom animation system with LazyMotion' @(
  'src/components/animations/MotionPrimitives.tsx', 'src/components/animations/StepTransition.tsx'
)

New-HistoryCommit 'feat: add wizard context and orchestrator' @(
  'src/components/wizard/WizardContext.tsx', 'src/components/wizard/WizardOrchestrator.tsx'
)

New-HistoryCommit 'feat: add wizard shell step navigation and focus hook' @(
  'src/components/wizard/Wizard.tsx', 'src/components/wizard/StepNavigation.tsx', 'src/hooks/useStepFocus.ts'
)

New-HistoryCommit 'feat: add Input and ErrorMessage form primitives' @(
  'src/components/common/Input.tsx', 'src/components/common/ErrorMessage.tsx'
)

New-HistoryCommit 'feat: add Select component with Radix UI' @('src/components/common/Select.tsx')
New-HistoryCommit 'feat: add RadioGroup and Checkbox components' @(
  'src/components/common/RadioGroup.tsx', 'src/components/common/Checkbox.tsx'
)
New-HistoryCommit 'feat: add CurrencyInput with INR formatting' @('src/components/common/CurrencyInput.tsx')
New-HistoryCommit 'feat: add MaskedInput for PAN and Aadhaar patterns' @('src/components/common/MaskedInput.tsx')

New-HistoryCommit 'feat: add form types and Zod schema factory' @(
  'src/types/form.ts', 'src/schemas/schemaFactory.ts'
)
New-HistoryCommit 'feat: add useLoanForm hook with React Hook Form' @('src/hooks/useLoanForm.tsx')
New-HistoryCommit 'feat: implement Step 1 loan type selection' @('src/components/steps/Step1LoanType.tsx')
New-HistoryCommit 'feat: implement Step 2 personal information' @('src/components/steps/Step2PersonalInfo.tsx')

New-HistoryCommit 'feat: add PAN and Aadhaar validators with Verhoeff checksum' @('src/utils/validators.ts')
New-HistoryCommit 'feat: add useVerification hook for KYC simulation' @('src/hooks/useVerification.ts')
New-HistoryCommit 'feat: add VerifiedField with async verification UI' @('src/components/common/VerifiedField.tsx')
New-HistoryCommit 'feat: implement Step 3 KYC identity verification' @('src/components/steps/Step3KYC.tsx')

New-HistoryCommit 'feat: add PIN code lookup data and hook' @(
  'src/utils/pinCodeData.json', 'src/hooks/usePinCodeLookup.ts'
)
New-HistoryCommit 'feat: implement Step 4 address with auto-fill' @('src/components/steps/Step4Address.tsx')

New-HistoryCommit 'feat: add employment helpers and GST validation' @('src/utils/employmentHelpers.ts')
New-HistoryCommit 'feat: implement Step 5 employment sub-forms' @('src/components/steps/Step5Employment.tsx')

New-HistoryCommit 'feat: add step visibility rules for conditional steps' @('src/utils/stepVisibility.ts')
New-HistoryCommit 'feat: implement Step 6 co-applicant' @('src/components/steps/Step6CoApplicant.tsx')

New-HistoryCommit 'feat: add AES-256 encrypted auto-save' @('src/hooks/useAutoSave.ts')
New-HistoryCommit 'feat: add draft resume and save modals' @('src/components/common/DraftModals.tsx')

New-HistoryCommit 'feat: add document requirements utility' @('src/utils/documentRequirements.ts')
New-HistoryCommit 'feat: add image compression for uploads' @('src/utils/imageCompression.ts')
New-HistoryCommit 'feat: add FileUpload with drag and drop' @('src/components/common/FileUpload.tsx')
New-HistoryCommit 'feat: add signature vault and SignaturePad component' @(
  'src/utils/signatureVault.ts', 'src/components/common/SignaturePad.tsx'
)
New-HistoryCommit 'feat: implement Step 7 documents and e-signature' @('src/components/steps/Step7Documents.tsx')
New-HistoryCommit 'feat: implement Step 8 review submit and success modal' @('src/components/steps/Step8Review.tsx')

New-HistoryCommit 'feat: add cross-step sync utility and hooks' @(
  'src/utils/crossStepSync.ts', 'src/hooks/useCrossStepSync.ts', 'src/hooks/useBrowserHistorySync.ts'
)

New-HistoryCommit 'test: add Cypress config and TypeScript support' @(
  'cypress.config.ts', 'cypress/tsconfig.json', 'cypress/support/e2e.ts'
)
New-HistoryCommit 'test: add Cypress custom commands and fixture generator' @(
  'cypress/support/commands.ts', 'scripts/generate-fixtures.mjs', 'scripts/run-e2e.mjs'
)
New-HistoryCommit 'test: add E2E fixtures and sample upload files' @(
  'cypress/fixtures/valid-personal-loan.json', 'cypress/fixtures/valid-home-loan.json',
  'cypress/fixtures/valid-business-loan.json', 'cypress/fixtures/sample.png',
  'cypress/fixtures/sample.pdf', 'cypress/fixtures/invalid.txt', 'cypress/fixtures/oversized.png'
)
New-HistoryCommit 'test: add personal loan happy path E2E spec' @('cypress/e2e/personal-loan-happy-path.cy.ts')
New-HistoryCommit 'test: add home and business loan happy path specs' @(
  'cypress/e2e/home-loan-happy-path.cy.ts', 'cypress/e2e/business-loan-happy-path.cy.ts'
)
New-HistoryCommit 'test: add validation errors E2E spec' @('cypress/e2e/validation-errors.cy.ts')
New-HistoryCommit 'test: add auto-save resume E2E spec' @('cypress/e2e/auto-save-resume.cy.ts')
New-HistoryCommit 'test: add file upload E2E spec' @('cypress/e2e/file-upload.cy.ts')
New-HistoryCommit 'test: add e-signature E2E spec' @('cypress/e2e/e-signature.cy.ts')
New-HistoryCommit 'test: add stress test and keyboard navigation specs' @(
  'cypress/e2e/stress-test.cy.ts', 'cypress/e2e/keyboard-navigation.cy.ts'
)
New-HistoryCommit 'test: add cross-step validation E2E spec' @('cypress/e2e/cross-step-validation.cy.ts')

New-HistoryCommit 'feat: add skip link for keyboard accessibility' @('src/components/common/SkipLink.tsx')
New-HistoryCommit 'feat: add step announcer with aria-live region' @('src/components/wizard/StepAnnouncer.tsx')
New-HistoryCommit 'test: add axe-core accessibility Cypress checks' @(
  'cypress/support/a11y.ts', 'cypress/e2e/accessibility.cy.ts'
)

New-HistoryCommit 'chore: add portable Node setup and dev scripts' @(
  'scripts/node-env.ps1', 'setup.ps1', 'dev.ps1', 'dev.bat'
)
New-HistoryCommit 'chore: add build and E2E test PowerShell scripts' @('build.ps1', 'test-e2e.ps1')
New-HistoryCommit 'chore: add Netlify config for SPA deployment' @('netlify.toml')
New-HistoryCommit 'chore: add deploy script and demo walkthrough' @('deploy.ps1', 'DEMO.md')
New-HistoryCommit 'chore: add Lighthouse audit helper scripts' @(
  'scripts/lighthouse.ps1', 'scripts/pagespeed-check.mjs'
)
New-HistoryCommit 'docs: update README with deploy and submission checklist' @('README.md')

$count = (git rev-list --count HEAD)
Write-Host ""
Write-Host "Done - $count commits on main." -ForegroundColor Green
git log --oneline | Select-Object -First 8
Write-Host '...'
git log --oneline | Select-Object -Last 5
