export function getCommandsWebviewContent() {
    const commandArray = [
        ["ShortcutMenuBar.save", "workbench.action.files.save"],
        ["ShortcutMenuBar.toggleTerminal", "workbench.action.terminal.toggleTerminal"],
        ["ShortcutMenuBar.toggleActivityBar", "workbench.action.toggleActivityBarVisibility"],
        ["ShortcutMenuBar.navigateBack", "workbench.action.navigateBack"],
        ["ShortcutMenuBar.navigateForward", "workbench.action.navigateForward"],
        ["ShortcutMenuBar.toggleRenderWhitespace", "editor.action.toggleRenderWhitespace"],
        ["ShortcutMenuBar.quickOpen", "workbench.action.quickOpen"],
        ["ShortcutMenuBar.findReplace", "editor.action.startFindReplaceAction"],
        ["ShortcutMenuBar.undo", "undo"],
        ["ShortcutMenuBar.redo", "redo"],
        ["ShortcutMenuBar.commentLine", "editor.action.commentLine"],
        ["ShortcutMenuBar.saveAll", "workbench.action.files.saveAll"],
        ["ShortcutMenuBar.openFile", "workbench.action.files.openFile"],
        ["ShortcutMenuBar.newFile", "workbench.action.files.newUntitledFile"],
        ["ShortcutMenuBar.goToDefinition", "editor.action.revealDefinition"],
        ["ShortcutMenuBar.cut", "editor.action.clipboardCutAction"],
        ["ShortcutMenuBar.copy", "editor.action.clipboardCopyAction"],
        ["ShortcutMenuBar.paste", "editor.action.clipboardPasteAction"],
        ["ShortcutMenuBar.compareWithSaved", "workbench.files.action.compareWithSaved"],
        ["ShortcutMenuBar.showCommands", "workbench.action.showCommands"],
        ["ShortcutMenuBar.startDebugging", "workbench.action.debug.start"],
        ["ShortcutMenuBar.indentLines", "editor.action.indentLines"],
        ["ShortcutMenuBar.outdentLines", "editor.action.outdentLines"],
        ["ShortcutMenuBar.openSettings", "workbench.action.openSettings"],
        ["ShortcutMenuBar.toggleWordWrap", "editor.action.toggleWordWrap"],
        ["ShortcutMenuBar.changeEncoding", "workbench.action.editor.changeEncoding"],
        ["ShortcutMenuBar.powershellRestartSession", "PowerShell.RestartSession"],
        ["Fold Level 1", "editor.foldLevel1"],
        ["Fold Level 2", "editor.foldLevel2"],
        ["Fold Level 3", "editor.foldLevel3"],
        ["Fold Level 4", "editor.foldLevel4"],
        ["Fold Level 5", "editor.foldLevel5"],
        ["Fold Level 6", "editor.foldLevel6"],
        ["Fold Level 7", "editor.foldLevel7"],
        ["Unfold All", "editor.unfoldAll"]
    ];
    const fileCommands = [
        ["File.New", "workbench.action.files.newUntitledFile"],
        ["File.Open", "workbench.action.files.openFile"],
        ["File.OpenFolder", "workbench.action.files.openFolder"],
        ["File.Save", "workbench.action.files.save"],
        ["File.SaveAs", "workbench.action.files.saveAs"],
        ["File.SaveAll", "workbench.action.files.saveAll"],
        ["File.Close", "workbench.action.closeActiveEditor"],
        ["File.CloseAll", "workbench.action.closeAllEditors"],
        ["File.CloseFolder", "workbench.action.closeFolder"],
        ["File.Revert", "workbench.action.files.revert"],
        ["File.Compare", "workbench.files.action.compareWithSaved"],
        ["File.Rename", "workbench.files.action.showActiveFileInExplorer"],
        ["File.RevealInExplorer", "revealFileInOS"],
        ["File.ShowOpenedFileInNewWindow", "workbench.action.files.showOpenedFileInNewWindow"],
        ["File.CopyPath", "workbench.action.files.copyPathOfActiveFile"],
        ["File.OpenRecent", "workbench.action.openRecent"]
    ];
    const editCommands = [
        ["Edit.Undo", "undo"],
        ["Edit.Redo", "redo"],
        ["Edit.Cut", "editor.action.clipboardCutAction"],
        ["Edit.Copy", "editor.action.clipboardCopyAction"],
        ["Edit.Paste", "editor.action.clipboardPasteAction"],
        ["Edit.Find", "actions.find"],
        ["Edit.Replace", "editor.action.startFindReplaceAction"],
        ["Edit.FindInFiles", "workbench.action.findInFiles"],
        ["Edit.ReplaceInFiles", "workbench.action.replaceInFiles"],
        ["Edit.CommentLine", "editor.action.commentLine"],
        ["Edit.FormatDocument", "editor.action.formatDocument"],
        ["Edit.FormatSelection", "editor.action.formatSelection"],
        ["Edit.IndentLine", "editor.action.indentLines"],
        ["Edit.OutdentLine", "editor.action.outdentLines"],
        ["Edit.SelectAll", "editor.action.selectAll"],
        ["Edit.DeleteLine", "editor.action.deleteLines"],
        ["Edit.InsertLineAbove", "editor.action.insertLineBefore"],
        ["Edit.InsertLineBelow", "editor.action.insertLineAfter"],
        ["Edit.CursorUndo", "cursorUndo"],
        ["Edit.CursorRedo", "cursorRedo"],
        ["Edit.MoveLineUp", "editor.action.moveLinesUpAction"],
        ["Edit.MoveLineDown", "editor.action.moveLinesDownAction"],
        ["Edit.DuplicateSelection", "editor.action.duplicateSelection"],
        ["Edit.JoinLines", "editor.action.joinLines"],
        ["Edit.ToggleWordWrap", "editor.action.toggleWordWrap"],
        ["Edit.TransformToUppercase", "editor.action.transformToUppercase"],
        ["Edit.TransformToLowercase", "editor.action.transformToLowercase"],
        ["Edit.TransformToTitlecase", "editor.action.transformToTitlecase"],
        ["Editor.TransposeLetters", "editor.action.transposeLetters"],
        ["Editor.SortLinesAscending", "editor.action.sortLinesAscending"],
        ["Editor.SortLinesDescending", "editor.action.sortLinesDescending"],
        ["Editor.RemoveDuplicateLines", "editor.action.removeDuplicateLines"],
        ["Editor.ToggleFold", "editor.toggleFold"],
        ["Editor.UnfoldRecursively", "editor.unfoldRecursively"],
        ["Editor.FoldAllBlockComments", "editor.foldAllBlockComments"],
        ["Editor.FoldAllRegions", "editor.foldAllMarkerRegions"],
        ["Editor.UnfoldAllRegions", "editor.unfoldAllMarkerRegions"],
        ["Editor.CreateCursorFromSelection", "editor.action.createCursorFromSelection"]
    ];
    const viewCommands = [
        ["View.CommandPalette", "workbench.action.showCommands"],
        ["View.OpenView", "workbench.view.explorer"],
        ["View.Explorer", "workbench.view.explorer"],
        ["View.Search", "workbench.view.search"],
        ["View.SourceControl", "workbench.view.scm"],
        ["View.Run", "workbench.view.debug"],
        ["View.Extensions", "workbench.view.extensions"],
        ["View.Problems", "workbench.actions.view.problems"],
        ["View.Output", "workbench.action.output.toggleOutput"],
        ["View.Debug", "workbench.view.debug"],
        ["View.Terminal", "workbench.action.terminal.toggleTerminal"],
        ["View.ZoomIn", "workbench.action.zoomIn"],
        ["View.ZoomOut", "workbench.action.zoomOut"],
        ["View.ZoomReset", "workbench.action.zoomReset"],
        ["View.ToggleSidebarVisibility", "workbench.action.toggleSidebarVisibility"],
        ["View.ToggleActivityBarVisibility", "workbench.action.toggleActivityBarVisibility"],
        ["View.ToggleStatusBarVisibility", "workbench.action.toggleStatusbarVisibility"],
        ["View.ToggleTabs", "workbench.action.toggleTabsVisibility"],
        ["View.ToggleFullScreen", "workbench.action.toggleFullScreen"],
        ["View.ToggleZenMode", "workbench.action.toggleZenMode"],
        ["View.TogglePanelPosition", "workbench.action.togglePanelPosition"],
        ["View.SplitEditorRight", "workbench.action.splitEditorRight"],
        ["View.SplitEditorDown", "workbench.action.splitEditorDown"],
        ["View.FocusFirstEditorGroup", "workbench.action.focusFirstEditorGroup"],
        ["View.FocusSecondEditorGroup", "workbench.action.focusSecondEditorGroup"],
        ["View.FocusThirdEditorGroup", "workbench.action.focusThirdEditorGroup"],
        ["View.ToggleMinimap", "editor.action.toggleMinimap"],
        ["View.ToggleRenderWhitespace", "editor.action.toggleRenderWhitespace"],
        ["View.ToggleBreadcrumbs", "breadcrumbs.toggle"],
        ["View.TogglePanelVisibility", "workbench.action.togglePanelVisibility"],
        ["View.ToggleAuxiliaryBar", "workbench.action.toggleAuxiliaryBar"],
        ["View.ResetViewSize", "workbench.action.resetViewSize"],
        ["View.MaximizeEditor", "workbench.action.maximizeEditor"],
        ["View.MinimizeOtherEditors", "workbench.action.minimizeOtherEditors"]
    ];
    const navigationCommands = [
        ["Navigation.GoToFile", "workbench.action.quickOpen"],
        ["Navigation.GoToSymbol", "workbench.action.gotoSymbol"],
        ["Navigation.GoToLine", "workbench.action.gotoLine"],
        ["Navigation.GoToDefinition", "editor.action.revealDefinition"],
        ["Navigation.GoToTypeDefinition", "editor.action.goToTypeDefinition"],
        ["Navigation.GoToImplementation", "editor.action.goToImplementation"],
        ["Navigation.GoToReferences", "editor.action.goToReferences"],
        ["Navigation.PeekDefinition", "editor.action.peekDefinition"],
        ["Navigation.PeekImplementation", "editor.action.peekImplementation"],
        ["Navigation.PeekReferences", "editor.action.referenceSearch.trigger"],
        ["Navigation.ShowAllSymbols", "workbench.action.showAllSymbols"],
        ["Navigation.NavigateBack", "workbench.action.navigateBack"],
        ["Navigation.NavigateForward", "workbench.action.navigateForward"],
        ["Navigation.NextEditor", "workbench.action.nextEditor"],
        ["Navigation.PreviousEditor", "workbench.action.previousEditor"],
        ["Navigation.NextInFile", "editor.action.marker.next"],
        ["Navigation.PreviousInFile", "editor.action.marker.prev"],
        ["Navigation.NextError", "editor.action.marker.nextInFiles"],
        ["Navigation.PreviousError", "editor.action.marker.prevInFiles"],
        ["Navigation.LastEditLocation", "workbench.action.navigateToLastEditLocation"],
        ["Navigation.SwitchEditor", "workbench.action.openEditorAtIndex1"], // 1-9 are supported
        ["Navigation.GoToNextSymbolHighlight", "editor.action.wordHighlight.next"],
        ["Navigation.GoToPreviousSymbolHighlight", "editor.action.wordHighlight.prev"],
        ["Navigation.GoToNextChange", "workbench.action.editor.nextChange"],
        ["Navigation.GoToPreviousChange", "workbench.action.editor.previousChange"],
        ["Navigation.GoToBracket", "editor.action.jumpToBracket"],
        ["Navigation.ToggleSuggestionDetails", "editor.action.toggleSuggestionDetails"],
        ["Navigation.RevealDeclaration", "editor.action.revealDeclaration"]
    ];
    const debugCommands = [
        ["Debug.Start", "workbench.action.debug.start"],
        ["Debug.Stop", "workbench.action.debug.stop"],
        ["Debug.Restart", "workbench.action.debug.restart"],
        ["Debug.Continue", "workbench.action.debug.continue"],
        ["Debug.Pause", "workbench.action.debug.pause"],
        ["Debug.StepOver", "workbench.action.debug.stepOver"],
        ["Debug.StepInto", "workbench.action.debug.stepInto"],
        ["Debug.StepOut", "workbench.action.debug.stepOut"],
        ["Debug.ToggleBreakpoint", "editor.debug.action.toggleBreakpoint"],
        ["Debug.EnableAllBreakpoints", "workbench.debug.viewlet.action.enableAllBreakpoints"],
        ["Debug.DisableAllBreakpoints", "workbench.debug.viewlet.action.disableAllBreakpoints"],
        ["Debug.RemoveAllBreakpoints", "workbench.debug.viewlet.action.removeAllBreakpoints"],
        ["Debug.AddConditionalBreakpoint", "editor.debug.action.conditionalBreakpoint"],
        ["Debug.RunToCursor", "editor.debug.action.runToCursor"],
        ["Debug.ShowHoverEvaluation", "editor.debug.action.showDebugHover"],
        ["Debug.FocusDebugConsole", "workbench.debug.action.focusDebugConsole"],
        ["Debug.ToggleDebugConsole", "workbench.debug.action.toggleRepl"],
        ["Debug.AddFunctionBreakpoint", "debug.addFunctionBreakpoint"],
        ["Debug.StartProfiling", "workbench.action.debug.startProfiling"],
        ["Debug.StopProfiling", "workbench.action.debug.stopProfiling"]
    ];
    const terminalCommands = [
        ["Terminal.New", "workbench.action.terminal.new"],
        ["Terminal.Split", "workbench.action.terminal.split"],
        ["Terminal.Kill", "workbench.action.terminal.kill"],
        ["Terminal.Clear", "workbench.action.terminal.clear"],
        ["Terminal.ToggleTerminal", "workbench.action.terminal.toggleTerminal"],
        ["Terminal.Rename", "workbench.action.terminal.rename"],
        ["Terminal.FocusNext", "workbench.action.terminal.focusNext"],
        ["Terminal.FocusPrevious", "workbench.action.terminal.focusPrevious"],
        ["Terminal.SelectAll", "workbench.action.terminal.selectAll"],
        ["Terminal.RunSelectedText", "workbench.action.terminal.runSelectedText"],
        ["Terminal.ScrollUp", "workbench.action.terminal.scrollUp"],
        ["Terminal.ScrollDown", "workbench.action.terminal.scrollDown"],
        ["Terminal.ScrollToTop", "workbench.action.terminal.scrollToTop"],
        ["Terminal.ScrollToBottom", "workbench.action.terminal.scrollToBottom"],
        ["Terminal.NavigationNext", "workbench.action.terminal.navigationNext"],
        ["Terminal.NavigationPrevious", "workbench.action.terminal.navigationPrevious"],
        ["Terminal.CreateWithProfile", "workbench.action.terminal.newWithProfile"],
        ["Terminal.RenameWithArg", "workbench.action.terminal.renameWithArg"],
        ["Terminal.AttachToSession", "workbench.action.terminal.attachToSession"],
        ["Terminal.DetachFromSession", "workbench.action.terminal.detachFromSession"],
        ["Terminal.WriteDataToTerminal", "workbench.action.terminal.writeDataToTerminal"]
    ];
    const workspaceCommands = [
        ["Workspace.NewWindow", "workbench.action.newWindow"],
        ["Workspace.CloseWindow", "workbench.action.closeWindow"],
        ["Workspace.CloseFolder", "workbench.action.closeFolder"],
        ["Workspace.SaveWorkspaceAs", "workbench.action.saveWorkspaceAs"],
        ["Workspace.DuplicateWorkspaceInNewWindow", "workbench.action.duplicateWorkspaceInNewWindow"],
        ["Workspace.AddFolder", "workbench.action.addRootFolder"],
        ["Workspace.RemoveFolder", "workbench.action.removeRootFolder"],
        ["Workspace.OpenSettings", "workbench.action.openSettings"],
        ["Workspace.OpenKeyboardShortcuts", "workbench.action.openGlobalKeybindings"],
        ["Workspace.OpenSnippets", "workbench.action.openSnippets"],
        ["Workspace.OpenUserTasks", "workbench.action.tasks.openUserTasks"],
        ["Workspace.ConfigureLanguageSpecificSettings", "workbench.action.configureLanguageBasedSettings"],
        ["Workspace.RestartExtensionHost", "workbench.action.restartExtensionHost"],
        ["Workspace.MergeWindow", "workbench.action.mergeAllWindows"],
        ["Workspace.ToggleWindowWidth", "workbench.action.toggleEditorWidths"],
        ["Workspace.ReloadWithExtensionsDisabled", "workbench.action.reloadWindowWithExtensionsDisabled"],
        ["Workspace.SaveWorkspace", "workbench.action.saveWorkspace"],
        ["Workspace.OpenWorkspaceConfig", "workbench.action.openWorkspaceConfigFile"]
    ];
    const extensionCommands = [
        ["Extensions.InstallExtension", "workbench.extensions.action.installExtension"],
        ["Extensions.ShowInstalledExtensions", "workbench.extensions.action.showInstalledExtensions"],
        ["Extensions.ShowRecommendedExtensions", "workbench.extensions.action.showRecommendedExtensions"],
        ["Extensions.ShowPopularExtensions", "workbench.extensions.action.showPopularExtensions"],
        ["Extensions.UpdateAllExtensions", "workbench.extensions.action.updateAllExtensions"],
        ["Extensions.EnableAllExtensions", "workbench.extensions.action.enableAllExtensions"],
        ["Extensions.DisableAllExtensions", "workbench.extensions.action.disableAllExtensions"],
        ["Extensions.ShowExtensionsForLanguage", "workbench.extensions.action.showLanguageExtensions"],
        ["Extensions.CheckForExtensionUpdates", "workbench.extensions.action.checkForUpdates"],
        ["Extensions.OpenExtensionsFolder", "workbench.extensions.action.openExtensionsFolder"]
    ];
    const editorGroupCommands = [
        ["EditorGroup.NewGroupAbove", "workbench.action.newGroupAbove"],
        ["EditorGroup.NewGroupBelow", "workbench.action.newGroupBelow"],
        ["EditorGroup.NewGroupLeft", "workbench.action.newGroupLeft"],
        ["EditorGroup.NewGroupRight", "workbench.action.newGroupRight"],
        ["EditorGroup.CloseGroup", "workbench.action.closeGroup"],
        ["EditorGroup.CloseOtherGroups", "workbench.action.closeOtherGroups"],
        ["EditorGroup.MoveEditorLeft", "workbench.action.moveEditorLeftInGroup"],
        ["EditorGroup.MoveEditorRight", "workbench.action.moveEditorRightInGroup"],
        ["EditorGroup.MoveEditorToLeftGroup", "workbench.action.moveEditorToLeftGroup"],
        ["EditorGroup.MoveEditorToRightGroup", "workbench.action.moveEditorToRightGroup"],
        ["EditorGroup.MoveEditorToAboveGroup", "workbench.action.moveEditorToAboveGroup"],
        ["EditorGroup.MoveEditorToBelowGroup", "workbench.action.moveEditorToBelowGroup"],
        ["EditorGroup.MoveEditorToFirstGroup", "workbench.action.moveEditorToFirstGroup"],
        ["EditorGroup.MoveEditorToLastGroup", "workbench.action.moveEditorToLastGroup"],
        ["EditorGroup.FocusPreviousGroup", "workbench.action.focusPreviousGroup"],
        ["EditorGroup.FocusNextGroup", "workbench.action.focusNextGroup"],
        ["EditorGroup.FocusAboveGroup", "workbench.action.focusAboveGroup"],
        ["EditorGroup.FocusBelowGroup", "workbench.action.focusBelowGroup"],
        ["EditorGroup.FocusLeftGroup", "workbench.action.focusLeftGroup"],
        ["EditorGroup.FocusRightGroup", "workbench.action.focusRightGroup"]
    ];
    const languageCommands = [
        ["Language.ChangeLanguageMode", "workbench.action.editor.changeLanguageMode"],
        ["Language.ConfigureLanguageBasedSettings", "workbench.action.configureLanguageBasedSettings"],
        ["Language.ShowReferences", "editor.action.showReferences"],
        ["Language.Rename", "editor.action.rename"],
        ["Language.TriggerParameterHints", "editor.action.triggerParameterHints"],
        ["Language.TriggerSuggest", "editor.action.triggerSuggest"],
        ["Language.ShowHover", "editor.action.showHover"],
        ["Language.QuickFix", "editor.action.quickFix"],
        ["Language.OrganizeImports", "editor.action.organizeImports"],
        ["Language.CodeAction", "editor.action.codeAction"],
        ["Language.SourceAction", "editor.action.sourceAction"],
        ["Language.FindAllReferences", "references-view.findReferences"],
        ["Language.InspectTMScopes", "editor.action.inspectTMScopes"],
        ["Language.ForceRetokenize", "editor.action.forceRetokenize"],
        ["Language.RefreshIntelliSense", "editor.action.reloadIntelliSense"],
        ["Language.RestartTServer", "typescript.restartTsServer"],
        ["Python.RunSelection", "python.execSelectionInTerminal"],
        ["Java.ForceCompile", "java.action.forceCompile"],
        ["Markdown.PreviewToggle", "markdown.showPreview"]
    ];
    const preferenceCommands = [
        ["Preferences.OpenSettings", "workbench.action.openSettings"],
        ["Preferences.OpenSettingsJson", "workbench.action.openSettingsJson"],
        ["Preferences.OpenUserSettings", "workbench.action.openGlobalSettings"],
        ["Preferences.OpenWorkspaceSettings", "workbench.action.openWorkspaceSettings"],
        ["Preferences.OpenFolderSettings", "workbench.action.openFolderSettings"],
        ["Preferences.OpenDefaultSettings", "workbench.action.openDefaultSettings"],
        ["Preferences.OpenKeyboardShortcuts", "workbench.action.openGlobalKeybindings"],
        ["Preferences.OpenKeyboardShortcutsJson", "workbench.action.openGlobalKeybindingsFile"],
        ["Preferences.OpenUserSnippets", "workbench.action.openSnippets"],
        ["Preferences.SelectColorTheme", "workbench.action.selectTheme"],
        ["Preferences.SelectIconTheme", "workbench.action.selectIconTheme"],
        ["Preferences.SelectProductIconTheme", "workbench.action.selectProductIconTheme"],
        ["Preferences.ConfigureDisplayLanguage", "workbench.action.configureLocale"],
        ["Preferences.OpenRemoteSettings", "workbench.action.openRemoteSettings"],
        ["Preferences.ConfigureRuntimeArgs", "workbench.action.configureRuntimeArguments"],
        ["Preferences.OpenWorkspaceKeybindings", "workbench.action.openWorkspaceKeybindingsFile"]
    ];
    const searchCommands = [
        ["Search.Find", "actions.find"],
        ["Search.Replace", "editor.action.startFindReplaceAction"],
        ["Search.FindInFiles", "workbench.action.findInFiles"],
        ["Search.ReplaceInFiles", "workbench.action.replaceInFiles"],
        ["Search.FindNext", "editor.action.nextMatchFindAction"],
        ["Search.FindPrevious", "editor.action.previousMatchFindAction"],
        ["Search.SearchEditor.CreateEditorFromSearch", "search.action.openNewEditor"],
        ["Search.SearchEditor.RerunSearchWithContext", "search.action.rerunSearchWithContext"],
        ["Search.ToggleCaseSensitive", "toggleSearchCaseSensitive"],
        ["Search.ToggleWholeWord", "toggleSearchWholeWord"],
        ["Search.ToggleRegex", "toggleSearchRegex"],
        ["Search.ToggleSearchPreserveCase", "toggleSearchPreserveCase"],
        ["Search.CollapseSearchResults", "search.action.collapseSearchResults"],
        ["Search.ShowNextSearchTerm", "search.history.showNext"],
        ["Search.ShowPreviousSearchTerm", "search.history.showPrevious"]
    ];
    const ExperimentalCommands = [
      ["DevTools.Toggle", "workbench.action.toggleDevTools"],
      ["Extension.ToggleAutoUpdate", "extensions.toggleAutoUpdate"],
      ["Task.RestartRunningTask", "workbench.action.tasks.restartTask"],
      ["Debug.OpenView", "workbench.debug.action.openDebugView"]
  ];
    const gitCommands = [
        ["Git.Clone", "git.clone"],
        ["Git.Init", "git.init"],
        ["Git.Commit", "git.commit"],
        ["Git.CommitAll", "git.commitAll"],
        ["Git.CommitAllSigned", "git.commitAllSigned"],
        ["Git.CommitSigned", "git.commitSigned"],
        ["Git.CommitStaged", "git.commitStaged"],
        ["Git.CommitStagedSigned", "git.commitStagedSigned"],
        ["Git.CommitEmpty", "git.commitEmpty"],
        ["Git.Push", "git.push"],
        ["Git.PushWithTags", "git.pushWithTags"],
        ["Git.Pull", "git.pull"],
        ["Git.Fetch", "git.fetch"],
        ["Git.Sync", "git.sync"],
        ["Git.Publish", "git.publish"],
        ["Git.Checkout", "git.checkout"],
        ["Git.Branch", "git.branch"],
        ["Git.CreateTag", "git.createTag"],
        ["Git.DeleteTag", "git.deleteTag"],
        ["Git.Merge", "git.merge"],
        ["Git.Rebase", "git.rebase"],
        ["Git.Stage", "git.stage"],
        ["Git.StageAll", "git.stageAll"],
        ["Git.StageChange", "git.stageChange"],
        ["Git.Unstage", "git.unstage"],
        ["Git.UnstageAll", "git.unstageAll"],
        ["Git.Clean", "git.clean"],
        ["Git.CleanAll", "git.cleanAll"],
        ["Git.Stash", "git.stash"],
        ["Git.StashPop", "git.stashPop"],
        ["Git.StashApply", "git.stashApply"],
        ["Git.StashDrop", "git.stashDrop"],
        ["Git.ShowOutput", "git.showOutput"],
        ["Git.Refresh", "git.refresh"],
        ["Git.OpenFile", "git.openFile"],
        ["Git.OpenAllChanges", "git.openAllChanges"],
        ["Git.OpenChange", "git.openChange"],
        ["Git.OpenRepositoryInGitHub", "git.openRepositoryInGithub"],
        ["Git.OpenAllChanges", "git.openAllChanges"],
        ["Git.OpenChangeInNextDiff", "git.openChangeInNextDiff"],
        ["Git.OpenChangeInPreviousDiff", "git.openChangeInPreviousDiff"],
        ["Git.OpenFileAtRevision", "git.openFileAtRevision"],
        ["Git.RefreshIndex", "git.refreshIndex"]
    ];
    const gitCommandDecorations = [
 ["git.decorations.modifiedForeground", "#git.decorations.modifiedForeground"],
 ["git.decorations.untrackedForeground", "#git.decorations.untrackedForeground"],
 ["git.decorations.deletedForeground", "#git.decorations.deletedForeground"],
 ["git.decorations.ignoredForeground", "#git.decorations.ignoredForeground"],
 ["git.decorations.conflictingForeground", "#git.decorations.conflictingForeground"],
 ["git.decorations.stagedForeground", "#git.decorations.stagedForeground"],
 ["git.decorations.enabled", "git.decorations.enabled"],
 ["git.decorations.enabled", "git.decorations.enabled"],
 ["git.decorations.enabled", "git.decorations.enabled"],
 ["git.decorations.showCommitInGutter", "git.decorations.showCommitInGutter"]
    ];
    const taskCommands = [
        ["Tasks.RunBuildTask", "workbench.action.tasks.build"],
        ["Tasks.RunTestTask", "workbench.action.tasks.test"],
        ["Tasks.RunTask", "workbench.action.tasks.runTask"],
        ["Tasks.RestartTask", "workbench.action.tasks.restartTask"],
        ["Tasks.ShowTasks", "workbench.action.tasks.showTasks"],
        ["Tasks.TerminateTask", "workbench.action.tasks.terminate"],
        ["Tasks.ConfigureTaskRunner", "workbench.action.tasks.configureTaskRunner"],
        ["Tasks.ConfigureDefaultBuildTask", "workbench.action.tasks.configureDefaultBuildTask"],
        ["Tasks.ConfigureDefaultTestTask", "workbench.action.tasks.configureDefaultTestTask"]
    ];

    let d
    // Combine all categories
    const allCommands = [
        ...gitCommandDecorations,
        ...ExperimentalCommands,
        ...commandArray,
        ...fileCommands,
        ...editCommands,
        ...viewCommands,
        ...navigationCommands,
        ...debugCommands,
        ...terminalCommands,
        ...workspaceCommands,
        ...extensionCommands,
        ...editorGroupCommands,
        ...languageCommands,
        ...preferenceCommands,
        ...searchCommands,
        ...gitCommands,
        ...taskCommands
    ];
    d = allCommands
    // Define category mapping for the dropdown
    const categories = [
        { id: 'custom', name: 'Generic Commands', commands: commandArray },
        { id: 'all', name: 'All Commands', commands: allCommands },
        { id: 'file', name: 'File Commands', commands: fileCommands },
        { id: 'edit', name: 'Edit Commands', commands: editCommands },
        { id: 'view', name: 'View Commands', commands: viewCommands },
        { id: 'navigation', name: 'Navigation Commands', commands: navigationCommands },
        { id: 'debug', name: 'Debug Commands', commands: debugCommands },
        { id: 'terminal', name: 'Terminal Commands', commands: terminalCommands },
        { id: 'workspace', name: 'Workspace Commands', commands: workspaceCommands },
        { id: 'extension', name: 'Extension Commands', commands: extensionCommands },
        { id: 'editorGroup', name: 'Editor Group Commands', commands: editorGroupCommands },
        { id: 'language', name: 'Language Commands', commands: languageCommands },
        { id: 'preference', name: 'Preference Commands', commands: preferenceCommands },
        { id: 'search', name: 'Search Commands', commands: searchCommands },
        { id: 'git', name: 'Git Commands', commands: gitCommands },
        { id: 'gitCommandDecorations', name: 'Git Decorations', commands: gitCommandDecorations },
        { id: 'task', name: 'Task Commands', commands: taskCommands },
        { id: 'ExperimentalCommands', name: 'Experimental Commands', commands: ExperimentalCommands },
    ];
    
    // Generate the dropdown options
    const categoryOptions = categories.map(category => {
        return `<option value="${category.id}">${category.name}</option>`;
    }).join('');

    type CommandTuple = [string, string];

    function generateCommandRows(commands: any) {
        return commands.map(([name, commandId]: [string, string]) => {
            // Format the display name by removing prefix and adding spaces
            const displayName = name.replace(/^[^.]*\./, '')
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

            return `
<tr data-category="${getCategoryIdForCommand(name)}">
  <td>${displayName}</td>
  <td><code>${commandId}</code></td>
  <td>
    <button class="copy-btn" data-command="${commandId}">Copy</button>
  </td>
</tr>
`;
        }).join('');
    }

    // Helper function to determine category id for a command based on its name
    function getCategoryIdForCommand(name: any) {
        if (name.startsWith('ShortcutMenuBar.')) return 'custom';
        if (name.startsWith('Navigation.')) return 'navigation';
        if (name.startsWith('File.')) return 'file';
        if (name.startsWith('Edit.')) return 'edit';
        if (name.startsWith('View.')) return 'view';
        if (name.startsWith('Go.') || name.startsWith('Navigate.')) return 'navigation';
        if (name.startsWith('Debug.')) return 'debug';
        if (name.startsWith('Terminal.')) return 'terminal';
        if (name.startsWith('Workspace.')) return 'workspace';
        if (name.startsWith('Extensions.')) return 'extension';
        if (name.startsWith('EditorGroup.')) return 'editorGroup';
        if (name.startsWith('Language.')) return 'language';
        if (name.startsWith('Preferences.')) return 'preference';
        if (name.startsWith('Search.')) return 'search';
        if (name.startsWith('Git.')) return 'git';
        if (name.startsWith('Tasks.')) return 'task';
        return 'other';
    }

    // Generate all command rows
    const commandRows = generateCommandRows(allCommands);

    // Return the full HTML content
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VSCode Commands Reference</title>
    <style>
        :root {
            --background: var(--vscode-editor-background, #1e1e1e);
            --foreground: var(--vscode-editor-foreground, #d4d4d4);
            --primary: var(--vscode-button-background, #0e639c);
            --primary-foreground: var(--vscode-button-foreground, #ffffff);
            --muted: var(--vscode-editor-inactiveSelectionBackground, #3a3d41);
            --muted-foreground: var(--vscode-disabledForeground, #888888);
            --border: var(--vscode-panel-border, #424242);
            --card: var(--vscode-editorWidget-background, #252526);
            --card-foreground: var(--vscode-editor-foreground, #d4d4d4);
            --radius: 6px;
            --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            --font-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-sans);
            line-height: 1.6;
            color: var(--foreground);
            background-color: var(--background);
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            font-size: 15px;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .header {
            padding-bottom: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background-clip: text;
            color: transparent;
            display: inline-block;
        }

        .header p {
            font-size: 1.1rem;
            color: var(--muted-foreground);
        }

        .section {
            padding: 0.5rem 0 2rem;
        }

        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
            color: var(--primary-foreground);
        }

        .section h3 {
            font-size: 1.4rem;
            margin: 1.5rem 0 1rem;
            color: var(--foreground);
        }

        .example-container {
            background-color: var(--card);
            border-radius: var(--radius);
            overflow: hidden;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border);
        }

        .example-header {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border);
            background-color: rgba(0, 0, 0, 0.2);
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--muted-foreground);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .example {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 100px;
        }

        .code {
            padding: 1rem;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            white-space: pre-wrap;
            border-right: 1px solid var(--border);
            overflow-x: auto;
        }

        .preview {
            padding: 1rem;
            overflow-x: auto;
            background-color: var(--background);
        }

        .preview h1,
        .preview h2,
        .preview h3,
        .preview h4,
        .preview h5,
        .preview h6 {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }

        .preview h1 {
            font-size: 2rem;
        }

        .preview h2 {
            font-size: 1.75rem;
            border-bottom: none;
            padding-bottom: 0;
        }

        .preview h3 {
            font-size: 1.5rem;
            margin: 0.5rem 0;
        }

        .preview h4 {
            font-size: 1.25rem;
        }

        .preview h5 {
            font-size: 1rem;
        }

        .preview h6 {
            font-size: 0.875rem;
        }

        .preview p {
            margin-bottom: 1rem;
        }

        .preview code {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: var(--font-mono);
            font-size: 0.85em;
        }

        .preview pre {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: var(--radius);
            overflow-x: auto;
            margin-bottom: 1rem;
        }

        .preview pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            font-size: 0.9em;
            color: var(--foreground);
        }

        .preview ul,
        .preview ol {
            padding-left: 2rem;
            margin-bottom: 1rem;
        }

        .preview blockquote {
            border-left: 4px solid var(--primary);
            padding: 0.5rem 1rem;
            margin: 0 0 1rem 0;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 0 var(--radius) var(--radius) 0;
        }

        .preview img {
            max-width: 100%;
            border-radius: var(--radius);
        }

        .preview table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
            border-radius: var(--radius);
            overflow: hidden;
        }

        .preview table th,
        .preview table td {
            padding: 0.75rem;
            border: 1px solid var(--border);
        }

        .preview table th {
            background-color: rgba(0, 0, 0, 0.2);
            font-weight: 600;
        }

        .preview table tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .preview hr {
            height: 1px;
            background-color: var(--border);
            border: none;
            margin: 1.5rem 0;
        }

        .note {
            background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
            border-left: 4px solid var(--primary);
            padding: 1rem;
            margin: 1.5rem 0;
            border-radius: 0 var(--radius) var(--radius) 0;
        }

        .note p:last-child {
            margin-bottom: 0;
        }

        .tag {
            display: inline-block;
            background-color: var(--primary);
            color: var(--primary-foreground);
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            margin-left: 0.5rem;
        }

        .tab-container {
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1rem;
        }

        .tab {
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.9rem;
            border-bottom: 2px solid transparent;
        }

        .tab.active {
            border-bottom: 2px solid var(--primary);
            color: var(--primary-foreground);
        }

        .expand-btn {
            background: none;
            border: none;
            color: var(--muted-foreground);
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .expand-btn:hover {
            color: var(--foreground);
        }

        .copy-btn {
            background: none;
            border: none;
            color: var(--muted-foreground);
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .copy-btn:hover {
            color: var(--foreground);
        }

        .code-annotation {
            color: #6A9955;
            /* Green for comments */
        }

        /* Additional ShadCN-inspired components */
        .callout {
            display: flex;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: var(--radius);
            background-color: rgba(0, 0, 0, 0.2);
            border-left: 4px solid var(--primary);
            margin-bottom: 1rem;
        }

        .callout-icon {
            width: 1.5rem;
            height: 1.5rem;
            flex-shrink: 0;
            margin-top: 0.125rem;
        }

        .callout-content {
            flex: 1;
        }

        .callout-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        /* Dark mode colors for syntax highlighting */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
            color: #6A9955;
        }

        .token.punctuation {
            color: #d4d4d4;
        }

        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol,
        .token.deleted {
            color: #b5cea8;
        }

        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
            color: #ce9178;
        }

        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
            color: #d4d4d4;
        }

        .token.atrule,
        .token.attr-value,
        .token.keyword {
            color: #569cd6;
        }

        .token.function,
        .token.class-name {
            color: #dcdcaa;
        }

        .token.regex,
        .token.important,
        .token.variable {
            color: #d16969;
        }

        /* Table of Contents */
        .toc {

            top: 2rem;
            background-color: var(--card);
            border-radius: var(--radius);
            padding: 1rem;
            margin-bottom: 2rem;
            border: 1px solid var(--border);
        }

        .toc-title {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
        }

        .toc-list {
            list-style: none;
            padding-left: 0;
        }

        .toc-item {
            margin-bottom: 0.5rem;
        }

        .toc-link {
            color: var(--foreground);
            text-decoration: none;
            display: inline-block;
            padding: 0.25rem 0;
            font-size: 0.9rem;
        }

        .toc-link:hover {
            color: var(--primary-foreground);
        }

        .toc-list .toc-list {
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }

            .example {
                grid-template-columns: 1fr;
            }

            .code {
                border-right: none;
                border-bottom: 1px solid var(--border);
            }
        }

        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1.5rem;
            overflow-x: auto;
        }

        .tab {
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            font-size: 0.9rem;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
        }

        .tab.active {
            border-bottom: 2px solid var(--primary);
            color: var(--primary-foreground);
            background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
        }

        .file-type-options {
            display: none;
        }

        .file-type-options.active {
            display: block;
        }

        .option-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .option-label {
            flex: 1;
        }

        .option-label label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .option-label .description {
            font-size: 0.85rem;
            color: var(--muted-foreground);
        }

        .option-input {
            flex: 0 0 auto;
            padding-left: 1rem;
        }

        /* Text classes as requested */
        .header-1 {
            text-3xl font-bold leading-tight tracking-tighter md: text-4xl lg:leading-[1.1];
            font-size: 1.875rem;
            font-weight: bold;
            line-height: 1.2;
            letter-spacing: -0.025em;
        }

        .header-2 {
            mt-3 text-muted-foreground text-thin text-center;
            margin-top: 0.75rem;
            color: var(--muted-foreground);
            font-weight: 300;
            text-align: center;
        }

        .header-3 {
            font-semibold mb-4 mt-4;
            font-weight: 600;
            margin-bottom: 1rem;
            margin-top: 1rem;
        }

        .text-p {
            text-balance font-light text-foreground text-sm text-thin;
            text-wrap: balance;
            font-weight: 300;
            color: var(--foreground);
            font-size: 0.875rem;
        }

        #saveButton {
            background-color: var(--primary);
            color: var(--primary-foreground);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 500;
        }

        #saveButton:hover {
            opacity: 0.9;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>VSCode Commands Reference</h1>
            <p>Below is a list of useful VSCode commands that you can use in your extension:</p>
        </div>
        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="Search for commands...">
            <select id="categoryFilter" class="category-dropdown">
                ${categoryOptions}
            </select>
        </div>
        <h4>File Commands</h4>
        <table id="commandsTable">
            <thead>
                <tr>
                    <th>Command Name</th>
                    <th>Command ID</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${commandRows}
            </tbody>
        </table>

        <div class="usage-examples">
            <h2>How to Use</h2>
            <p>To use these commands in your extension, you can register them in the extension:</p>
            <p>1) Copy the command, then click on the menu button in the pane and select Add Command.</p>
            <p>2) Input the cmd, the label and where you would like it stored on your quick access panel.</p>
            <p>3) Enjoy.</p>
        </div>
    </div>


    <script>
        (function () {
            // Handle copy button clicks
            const copyButtons = document.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const commandId = button.getAttribute('data-command');
                    navigator.clipboard.writeText(commandId).then(() => {
                        // Show success message
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 1500);
                    });
                });
            });

            // Get references to DOM elements
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const table = document.getElementById('commandsTable');
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            const noResults = document.getElementById('noResults');

            // Function to filter the commands
            function filterCommands() {
                const query = searchInput.value.toLowerCase();
                const selectedCategory = categoryFilter.value;

                let visibleRows = 0;

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const nameCol = row.getElementsByTagName('td')[0];
                    const cmdCol = row.getElementsByTagName('td')[1];
                    const rowCategory = row.getAttribute('data-category');

                    if (nameCol && cmdCol) {
                        const nameText = nameCol.textContent || nameCol.innerText;
                        const cmdText = cmdCol.textContent || cmdCol.innerText;

                        const matchesSearch = query === '' ||
                            nameText.toLowerCase().includes(query) ||
                            cmdText.toLowerCase().includes(query);

                        const matchesCategory = selectedCategory === 'all' || rowCategory === selectedCategory;

                        if (matchesSearch && matchesCategory) {
                            row.style.display = '';
                            visibleRows++;
                        } else {
                            row.style.display = 'none';
                        }
                    }
                }

                // Show or hide the "no results" message
                if (visibleRows === 0) {
                    noResults.style.display = 'block';
                    table.style.display = 'none';
                } else {
                    noResults.style.display = 'none';
                    table.style.display = 'table';
                }
            }

            // Add event listeners
            searchInput.addEventListener('input', filterCommands);
            categoryFilter.addEventListener('change', filterCommands);

            // Initial filter application
            filterCommands();
        })();
    </script>
</body>

</html>`;
}