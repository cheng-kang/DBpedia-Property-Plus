<template>
  <div class="entry">
    <template
      v-if="pairs.length != 1 && confirmedPairIndex === null"
    >
      <p style="">Found <strong>{{pairs.length}}</strong> potential entity-property pairs:</p>
      <el-select v-model="selectedPairIndex" placeholder="Select">
        <el-option
          v-for="(pair, idx) in pairs"
          :key="`pair-${idx}`"
          :value="idx"
        >
          <span style="float: left; color: #8492A6;">{{ pair.entity }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ pair.property }}</span>
        </el-option>
      </el-select>
      <p>Entity: <span style="font-weight: bold;">{{pairs[selectedPairIndex].entity}}</span></p>
      <p>Property: <span style="font-weight: bold;">{{pairs[selectedPairIndex].property}}</span></p>
      <div style="padding: 5px 0 8px 0; float: right;">
        <el-button type="danger">Discard</el-button>
        <el-button type="info" @click="confirmPairSelection">Confirm</el-button>
      </div>
      <div class="clearfix" style="font-size: 10px; color: #8492A6;">
        *You can "Confirm" 1 pair to continue; or "Discard" all options if none is what you are expecting.
      </div>
    </template>
    <template v-if="(confirmedPairIndex !== null) && !isResultDiscarded">
    <!-- ↓↓↓v-loading wrapper div (v-loading is not working with template tag)↓↓↓ -->
    <div v-loading="replacingPairState === 'loading'">
      <el-popover
        ref="entityPopover"
        placement="top"
        width="160"
        trigger="hover">
        <p>Click buttons below to copy:</p>
        <div style="text-align: center; margin: 0">
          <el-button size="mini" type="text" v-clipboard:copy="pentity" @click="toast">entity</el-button>
          <el-button size="mini" type="text" v-clipboard:copy="pageName" @click="toast" v-if="pentity !== pageName">page name</el-button>
          <el-button size="mini" type="text" v-clipboard:copy="pageLink" @click="toast">link</el-button>
        </div>
      </el-popover>
      <!-- Entity sameAs Popover -->
      <el-popover
        ref="entitySameAsPopover"
        placement="top"
        width="180"
        trigger="hover">
        <p>Not the correct entity? </p>
        <p>
          <small>Click the buttons below to 1) create a new "sameAs" name to this entity; 2) view available "sameAs" names; 3) discard this entity. </small>
        </p>
        <div style="text-align: right; margin: 0">
          <el-button-group>
            <el-button size="mini" type="danger" @click="isResultDiscarded = true">Discard</el-button>
            <el-button size="mini" type="info" @click="isSameAsInspectorVisible = true">View</el-button>
            <el-button size="mini" type="success" @click="isSameAsEditorVisible = true">Add</el-button>
          </el-button-group>
        </div>
      </el-popover>
      <!-- End: Entity sameAs Popover -->
      <!-- sameAs Inspector Dialog -->
      <el-dialog size="large" title='"sameAs" Inspector' :visible="isSameAsInspectorVisible" top="30%" :show-close="false">
        <related-entity-view
          :entity="pentity"
          :pageName="pageName"
          :moreSearchResult="moreSearchResult"
          @loadReplacingPair="loadReplacingPair"
          @close="isSameAsInspectorVisible = false"
        />
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="isSameAsInspectorVisible = false">Dismiss</el-button>
        </span>
      </el-dialog>
      <!-- End: sameAs Inspector Dialog -->
      <!-- sameAs Editor Dialog -->
      <el-dialog size="large" title="Add sameAs" :visible="isSameAsEditorVisible" top="30%" :show-close="false">
        <related-entity-editor :entity="pentity" :pageName="pageName" @close="isSameAsEditorVisible = false"/>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" icon="close" @click="isSameAsEditorVisible = false">Dismiss</el-button>
        </span>
      </el-dialog>
      <!-- End: sameAs Editor Dialog -->
      <p>
        Entity: <span style="font-weight: bold; text-decoration: underline;" v-popover:entityPopover>{{pentity}}{{pentity === pageName ? '' : ` (${pageName})`}}</span>
        <i class="el-icon-information" v-show="replacingPair === null" v-popover:entitySameAsPopover></i>
      </p>
      <div 
        v-show="replacingPair !== null"
        style="font-size: 10px;border: 0.5px solid #eeeeee; padding: 5px; border-radius: 5px; background-color: #eeeeee;"
      >
        Don't want this related entity?
        <el-button size="mini" type="text" style="color: #475669; text-decoration: underline; font-size: 10px;" @click="replacingPair = null">Go back</el-button>
      </div>
      <p>Property: <span style="font-weight: bold;">{{pproperty}}</span></p>
      <hr>
      <p style="color: #8492A6;" v-show="!showConfirmedResult">
        Found DBpedia page <a :href="'http://dbpedia.org/page/'+pageName.replace(/\s/g, '_')" target="blank" style="color: #8492A6;"><strong>{{pageName}}</strong></a>, and it's <strong>{{propertyList.length}}</strong> propert{{propertyList.length > 1 ? 'ies' : 'y'}}. <em v-if="Object.keys(availableRecipes).length > 0">(And {{Object.keys(availableRecipes).length}} custom recipe{{Object.keys(availableRecipes).length === 1 ? '' : 's'}}!)</em>
      </p>
      <hr v-show="!showConfirmedResult">
      <el-tabs type="border-card" v-show="!showConfirmedResult">
        <el-tab-pane label="Suggestion">
          <p style="font-size: 12px; color: #8492A6;">Property suggestions:</p>
          <template v-if="propertySuggestionList.length === 0">
            <div style="height: 50px; font-size: 12px; color: #8492A6; display: flex; align-items: center; justify-content: center;">
              No suggestion.
            </div>
          </template>
          <template v-if="propertySuggestionList.length !== 0">
            <el-select v-model="selectedPropertySuggestion" @change="selectProperty">
              <el-option
                v-for="(item, index) in propertySuggestionList"
                :key="index"
                :value="item"
              >
              </el-option>
            </el-select>
            <p style="font-size: 12px; color: #8492A6;">Selected property value:</p>
            <template v-if="propertyList.indexOf(selectedPropertySuggestion) === -1" v-loading="isLoadingSuggestedRecipeResult">
              <div class="text-box">
                {{suggestedRecipeResult ? suggestedRecipeResult.result || suggestedRecipeResult.error : 'loading...'}}
              </div>
              <el-button style="float: right; clear: both; color: #475669;" type="text" size="small" @click="getSuggestedRecipeValue">Reload</el-button>
            </template>
            <div class="text-box" v-if="propertyList.indexOf(selectedPropertySuggestion) !== -1">
              <template v-if="suggestion.length === 1">
                <property-value :property="suggestion[0]"/>
              </template>
              <template v-if="suggestion.length > 1">
                <el-checkbox
                  v-for="(item, idx) in suggestion"
                  v-model="selectedPropertyMultiValueSelection"
                  :label="idx"
                  :key="idx"
                >
                  <property-value :property="suggestion[idx]"/>
                </el-checkbox>
              </template>
            </div>
            <div class="button-group">
              <el-button type="danger" @click="discardProperty(selectedPropertySuggestion)">Discard</el-button>
              <el-button type="info" @click="confirmPropertySelection(selectedPropertySuggestion, propertyList.indexOf(selectedPropertySuggestion) === -1 ? {value: suggestedRecipeResult.result} || '' : getSelectedPropertyValue('suggestion'), availableRecipes[selectedPropertySuggestion] ? availableRecipes[selectedPropertySuggestion].label || '' : '')">Confirm</el-button>
            </div>
            <div class="clearfix" style="font-size: 10px; color: #8492A6;">
              *If the suggested entity/property is relevant, click "Confirm"; else, click "Discard". If multiple suggestions are provided, by clicking "Confirm"/"Discard", future appearance of the selected suggestion will be affected accordingly.
            </div>
          </template>
        </el-tab-pane>
        <el-tab-pane label="All" v-if="propertyValue">
          <p style="font-size: 12px; color: #8492A6;">All properties:</p>
          <el-select v-model="selectedProperty" @change="selectProperty">
            <el-option v-for="(item, index) in propertyList" :key="index" :value="item"/>
          </el-select>
          <p style="font-size: 12px; color: #8492A6;">Selected property value:</p>
          <div class="text-box">
            <template v-if="propertyValue.length === 1">
              <property-value :property="propertyValue[0]"/>
            </template>
            <template v-if="propertyValue.length > 1">
              <el-checkbox
                v-for="(item, idx) in propertyValue"
                v-model="selectedPropertyMultiValueSelection"
                :label="idx"
                :key="idx"
              >
                <property-value :property="propertyValue[idx]"/>
              </el-checkbox>
            </template>
          </div>
          <div class="button-group">
            <el-button type="danger" @click="discardProperty(selectedProperty)">Discard</el-button>
            <el-button type="info" @click="confirmPropertySelection(selectedProperty, getSelectedPropertyValue('all'))">Confirm</el-button>
          </div>
          <div class="clearfix" style="font-size: 10px; color: #8492A6;">
            *If the suggested entity/property is relevant, click "Confirm"; else, click "Discard". If multiple suggestions are provided, by clicking "Confirm"/"Discard", future appearance of the selected suggestion will be affected accordingly.
          </div>
        </el-tab-pane>
        <el-tab-pane label="Custom">
          <template v-show="Object.keys(availableRecipes).length > 0">
            <p class="label">Available Recipe:</p>
            <el-select v-model="selectedRecipe" @change="selectRecipe" placeholder="Select">
              <el-option
                v-for="(key, idx) in Object.keys(availableRecipes)"
                :key="idx"
                :value="key"
                :label="availableRecipes[key].name">
              </el-option>
            </el-select>
          </template>
          <p class="label">All properties:</p>
          <el-select v-model="recipeProperties" multiple placeholder="Select">
            <el-option
              v-for="item in propertyList"
              :key="item"
              :value="item"
              :label="item">
            </el-option>
          </el-select>
          <p class="label" v-show="recipeProperties.length > 0">Property value preview:</p>
          <template v-for="(item, idx) in recipeProperties">
            <el-collapse>
              <el-collapse-item :title="(idx+1)+'.'+item">
                <p class="label">Use <strong>data[{{idx}}]</strong> to refer to:</p>
                <pre class="text-box" v-highlightjs>
                  <code class="json">{{pageData[item][0].value}}</code>
                </pre>
                <p class="label">Use <strong>rawData[{{idx}}]</strong> to refer to:</p>
                <pre class="text-box" v-highlightjs>
                  <code class="json">{{pageData[item]}}</code>
                </pre>
              </el-collapse-item>
            </el-collapse>
          </template>
          <p class="label">Recipe editor:</p>
          <el-input
            type="textarea"
            class="test"
            :autosize="{ minRows: 4, maxRows: 20}"
            placeholder="e.g. return data[0];"
            v-model="recipeScript"
          />
          <div style="padding: 16px 0px 4px 0px;">
            <el-button-group style="float: right;">
              <el-button type="danger" size="small" @click="removeRecipe">Remove</el-button>
              <el-button type="success" size="small" @click="saveRecipe">Save</el-button>
              <el-button type="primary" size="small" @click="runCustomRecipe" :loading="isLoadingRecipeResult">Run</el-button>
            </el-button-group>
            <el-button style="float: right; clear: both; color: #475669;" type="text" size="small" @click="resetRecipe">Reset</el-button>
          </div>
          <p class="label">Recipe Name:</p>
          <el-input placeholder="custom recipe" v-model="recipeName"></el-input>
          <p class="label">Recipe Display Label:</p>
          <el-input placeholder="*optional" v-model="recipeLabel"></el-input>
          <p class="label">Recipe Value:</p>
          <div class="text-box" :class="{ error: recipeResult && recipeResult.error }"
            v-loading="isLoadingRecipeResult"
          >
            {{ recipeResult ? recipeResult.result || recipeResult.error : ''}}
          </div>
          <template v-if="selectedRecipe && recipeResult && recipeResult.result">
            <div class="button-group">
              <el-button type="danger" @click="discardProperty(selectedRecipe)">Discard</el-button>
              <el-button type="info" @click="confirmPropertySelection(selectedRecipe, {value: recipeResult.result}), availableRecipes[selectedRecipe].label">Confirm</el-button>
            </div>
            <div class="clearfix" style="font-size: 10px; color: #8492A6;">
              *If the suggested entity/property is relevant, click "Confirm"; else, click "Discard". If multiple suggestions are provided, by clicking "Confirm"/"Discard", future appearance of the selected suggestion will be affected accordingly.
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
      <template v-if="showConfirmedResult">
        <p class="text-box-title">
          Confirmed Property:
        </p>
        <div class="text-box" style="background-color: white; width: auto">
          {{confirmedPropertyLabel ? `${confirmedPropertyLabel} (${confirmedProperty})` : confirmedProperty}}
        </div>
        <p class="text-box-title">
          Content suggestions:
        </p>
        <content-suggestion :content="getConfirmedContent()"/>
        <content-suggestion :content="getSimpleSentence()"/>
      </template>
      </div>
    </template>
    <template v-if="isResultDiscarded">
      <p style="color: #8492A6;">
        Result discarded.
      </p>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { UPDATE_PPR_DIALOG_VISIBILITY, UPDATE_PPR_PAIR } from '../store/types'
import fuzz from 'fuzzball'
import pluralize from 'pluralize'
import PropertyValue from './PropertyValue'
import ContentSuggestion from './ContentSuggestion'
import RelatedEntityView from './RelatedEntityView'
import RelatedEntityEditor from './RelatedEntityEditor'
export default {
  name: 'entry',
  components: {
    PropertyValue, ContentSuggestion, RelatedEntityView, RelatedEntityEditor
  },
  props: [
    'entryData'
  ],
  data () {
    return {
      //
      // Multiple pairs might be available,
      // users need to confirm their selection to proceed.
      //
      //    selectedPairIndex: is the current selection
      //    confirmedPairIndex: is the confirmed selection
      selectedPairIndex: 0,
      confirmedPairIndex: null,

      //
      // ↓↓↓All variables below are data of the confirmed pair↓↓↓
      //

      //    - propertyList: (Tab: All)
      //        is the list of all available property names from DBpedia.
      //    - propertySuggestionList: (Tab: Suggestion)
      //        is the list of generated suggestion property/custom recipe names
      //    - selectedPropertyMultiValueSelection: (Tab: All & Suggestion)
      //        is the list of the selection among multiple values of a property
      //        e.g. Albert Einstein's children: ['Hans'] (available choices ['Hans', 'Lieserl'])
      //    - selectedProperty: (Tab: All)
      //        is the selected property name
      //    - selectedPropertySuggestion: (Tab: Suggestion)
      //        is the selected property/custom recipe name in Tab: Suggestion
      //    - suggestedRecipeResult: (Tab: Suggestion)
      //        is the value of the suggested recipe result
      //    - isLoadingSuggestedRecipeResult: (Tab: Suggestion)
      //        when the client is waiting for suggested recipe result from the server,
      //        `isLoadingSuggestedRecipeResult` will be set to true; otherwise, false.
      //    - recipeProperties: (Tab: Custom)
      //        is the list of related properties of the selected custom recipe
      //    - recipeName: (Tab: Custom)
      //        is the name of a new recipe or the selected recipe.
      //        It's binded with the recipeName input field.
      //    - recipeLabel: (Tab: Custom)
      //        is the diaplay name of a new recipe or the selected recipe.
      //        If set, the label will be used (rather than recipe name) when generating content suggestion.
      //        It's binded with the recipeLabel input field.
      //    - recipeScript: (Tab: Custom)
      //        is the script of a new recipe or the selected recipe
      //        It's binded with the recipeSript input field.
      //    - recipeResult: (Tab: Custom)
      //        is the value of the current recipe result
      //    - isLoadingRecipeResult: (Tab: Custom)
      //        when the client is waiting for selected recipe result from the server,
      //        `isLoadingRecipeResult` will be set to true; otherwise, false.
      //    - availableRecipes: (Tab: Suggestion & Custom)
      //        is the list of recipes that are available to the current entity.
      //        A recipe is available to an entity if the entity contains all properties
      //        in that recipe.
      //    - selectedRecipe: (Tab: Custom)
      //        is the name of the selected recipe.
      //        It's binded with the selectedRecipe select-ui element.
      //    - confirmedProperty: (Tab: Suggestion & All & Custom)
      //        is the name of the confirmed property/custom recipe name.
      //    - confirmedPropertyValue: (Tab: Suggestion & All & Custom)
      //        is the value of confirmedProperty
      //    - shouldAutoConfirmTheOnlySuggestion: (not available at the moment)
      //        if the value is set to true, auto confirm the selection of the only suggestion.
      //    - showConfirmedResult:
      //        a boolean value to toggle the appearance of the confirm result HTML
      //    - isResultDiscarded:
      //        a boolean value to record if the result is discarded. UI will be changed accordingly.
      //
      propertyList: [],
      propertySuggestionList: [],
      selectedPropertyMultiValueSelection: [0],
      selectedProperty: '',
      selectedPropertySuggestion: '',
      suggestedRecipeResult: null,
      isLoadingSuggestedRecipeResult: false,
      recipeProperties: [],
      recipeName: '',
      recipeLabel: '',
      recipeScript: '',
      recipeResult: null,
      isLoadingRecipeResult: false,
      availableRecipes: [],
      selectedRecipe: '',
      confirmedProperty: null,
      confirmedPropertyLabel: null,
      confirmedPropertyValue: null,
      shouldAutoConfirmTheOnlySuggestion: false,
      showConfirmedResult: false,
      isResultDiscarded: false,
      isSameAsInspectorVisible: false,
      isSameAsEditorVisible: false,
      replacingEntityName: null,
      replacingPair: null,
      replacingPairState: 'prepare' // 'prepare', 'loading', 'success', 'fail'
    }
  },
  computed: {
    ...mapState({
      isProcessingContent: state => state.isProcessingContent,
      entries: state => state.entries,
      processingStatusMsg: state => state.processingStatusMsg,
      processingErrorMsg: state => state.processingErrorMsg
    }),
    entry () {
      return this.entryData.entry
    },
    pairs () {
      return this.entryData.pairs
    },
    //
    // ↓↓↓All variable below are data of the confirmed pair↓↓↓
    //
    pair () {
      return this.replacingPair || this.entryData.pairs[this.confirmedPairIndex]
    },
    // Potential entity, prefix 'p' is used to avoid naming collision
    pentity () {
      return this.pair.entity
    },
    pageLink () {
      return 'http://dbpedia.org/page/' + this.pageName.replace(/ /g, '_')
    },
    // Potential property, prefix 'p' is used to avoid naming collision
    pproperty () {
      return this.pair.property
    },
    pageName () {
      return this.pair.pageName
    },
    moreSearchResult () {
      return this.pair.moreSearchResult
    },
    pageData () {
      return this.pair.pageData
    },
    suggestion () {
      return this.pageData[this.selectedPropertySuggestion]
    },
    // Value of selected property in the All tab
    propertyValue () {
      return this.pageData[this.selectedProperty]
    }
  },
  watch: {
    confirmedPairIndex (newValue) {
      // In case something unexpected happens.
      if (newValue === null) { return }

      // If default sameAs is set, load sameAs
      let allSameAs = this.$ls.get('sameAs', {})
      let currentEntitySameAs = allSameAs[this.pentity]
      if (currentEntitySameAs !== undefined) {
        let defaultSameAs = currentEntitySameAs.default || null
        if (defaultSameAs !== null) {
          this.loadReplacingPair(defaultSameAs)
          return
        }
      }

      // Else, display current entity data
      // Reset related data
      this.resetData()
      // Generate property & suggestion data
      this.generateData()
    }
  },
  created () {
    if (this.pairs.length === 1) {
      this.confirmedPairIndex = 0
    }
  },
  methods: {
    confirmPairSelection () {
      this.confirmedPairIndex = this.selectedPairIndex
    },
    resetData () {
      this.propertyList = []
      this.propertySuggestionList = []
      this.selectedProperty = ''
      this.selectedPropertySuggestion = ''
      this.recipeProperties = []
      this.customPropertyOptions = []
      this.confirmedProperty = null
    },
    generateData () {
      //
      // Init propertyList:
      //    And sort the list with fuzzy matching with pproperty.
      //
      let that = this
      this.propertyList = Object.keys(this.pair.pageData)
      this.propertyList.sort((a, b) => {
        let scoreA = fuzz.token_set_ratio(that.pproperty, a)
        let scoreB = fuzz.token_set_ratio(that.pproperty, b)
        return scoreB - scoreA
      })
      // Refresh available recipes:
      //    This process involves the property list,
      //    thus it should be invoked after initializing propertyList.
      this.refreshAvailableRecipe()

      //
      // Generating Suggestions:
      //     Property names/custom recipe names
      //     with 100 score by fuzzy matching with pproperty.
      //
      for (let i = 0; i < this.propertyList.length; i++) {
        if (fuzz.token_set_ratio(this.pproperty, this.propertyList[i]) === 100) {
          this.propertySuggestionList.push(this.propertyList[i])
        }
      }
      let recipeKeys = Object.keys(this.availableRecipes)
      let recipeSuggestionList = []
      for (let i = 0; i < recipeKeys.length; i++) {
        if (fuzz.token_set_ratio(this.pproperty, recipeKeys[i]) === 100) {
          this.propertySuggestionList.push(recipeKeys[i])
          recipeSuggestionList.push(recipeKeys[i])
        }
      }

      //
      // Check Preference:
      //    If preference exists, put it in the first place.
      //
      let preferences = this.$ls.get('preferences', {})
      let preference = preferences[this.pproperty]

      // If preference exist, suggest preference
      if (preference !== undefined && (Object.keys(this.availableRecipes).indexOf(preference) !== -1 || this.propertyList.indexOf(preference) !== -1)) {
        let preferenceIndex = this.propertySuggestionList.indexOf(preference)
        if (preferenceIndex > 0) {
          // When it's already in the suggestion list,
          // remove it
          this.propertySuggestionList.splice(preferenceIndex, 1)
          // then insert preference at index 0
          this.propertySuggestionList.splice(0, 0, preference)
        }
      }

      //
      // Check Priority Rules
      //
      let arrayContainsArray = (superset, subset) => {
        if (subset.length === 0) {
          return false
        }
        return subset.every(function (value) {
          return (superset.indexOf(value) >= 0)
        })
      }
      let swap = (arr, x, y) => {
        let origin = arr[x]
        arr.splice(x, 1, arr[y])
        Vue.set(arr, y, origin)
      }
      let priorityRules = this.$ls.get('priorityRules', [])
      let priorityRulesMuted = this.$ls.get('priorityRulesMuted', [])
      for (let i = 0; i < recipeSuggestionList.length; i++) {
        for (let j = i + 1; j < recipeSuggestionList.length; j++) {
          let name1 = recipeSuggestionList[i]
          let name2 = recipeSuggestionList[j]
          let arr1 = this.availableRecipes[name1].properties
          let arr2 = this.availableRecipes[name2].properties
          if (arrayContainsArray(arr1, arr2)) {
            if (priorityRules.indexOf(`${name1}>>>${name2}`) === -1 && priorityRulesMuted.indexOf(`${name1}>>>${name2}`) === -1) {
              this.notifyPotentialPriorityRule([name1, name2])
            } else {
              let idx1 = this.propertySuggestionList.indexOf(name1)
              let idx2 = this.propertySuggestionList.indexOf(name2)
              if (idx1 > idx2) {
                swap(this.propertySuggestionList, idx1, idx2)
              }
            }
          } else if (arrayContainsArray(arr2, arr1)) {
            if (priorityRules.indexOf(`${name2}>>>${name1}`) === -1 && priorityRulesMuted.indexOf(`${name2}>>>${name1}`) === -1) {
              this.notifyPotentialPriorityRule([name2, name1])
            } else {
              let idx1 = this.propertySuggestionList.indexOf(name1)
              let idx2 = this.propertySuggestionList.indexOf(name2)
              if (idx1 < idx2) {
                swap(this.propertySuggestionList, idx1, idx2)
              }
            }
          }
        }
      }

      //
      // Init select-ui elements default value
      //

      // Tab: All
      if (this.propertyList.length > 0) {
        this.selectedProperty = this.propertyList[0]
      }
      // Tab: Suggestion
      if (this.propertySuggestionList.length > 0) {
        this.selectedPropertySuggestion = this.propertySuggestionList[0]
        if (Object.keys(this.availableRecipes).indexOf(this.selectedPropertySuggestion) !== -1) {
          // Load suggested recipe value
          this.getSuggestedRecipeValue()
        }
      }
      // If "shouldAutoConfirmTheOnlySuggestion" is set to true
      // confirm property selection automatically.
      // (not implemented at the moment)
      if (this.propertySuggestionList.length === 1 && this.shouldAutoConfirmTheOnlySuggestion) {
        this.confirmedProperty = this.propertySuggestionList[0]
      }
    },
    confirmPropertySelection (property, value, label = '') {
      console.log(label)
      this.confirmedProperty = property
      this.confirmedPropertyValue = value
      this.confirmedPropertyLabel = label
      this.showConfirmedResult = true

      // Save preference
      let preferences = this.$ls.get('preferences', {})
      this.$ls.set('preferences', {
        ...preferences,
        [this.pproperty]: this.confirmedProperty
      })
    },
    discardProperty (property) {
      let preferences = this.$ls.get('preferences', {})
      let preference = preferences[this.pproperty]
      if (preference !== undefined && preference === property) {
        Vue.delete(preferences, this.pproperty)
        this.$ls.set('preferences', preferences)
      }
      this.isResultDiscarded = true
    },
    selectProperty () {
      this.selectedPropertyMultiValueSelection = [0]
    },
    getSelectedPropertyValue (type) {
      let val = null
      if (type === 'all') {
        val = this.pageData[this.selectedProperty]
      } else if (type === 'suggestion') {
        val = this.pageData[this.selectedPropertySuggestion]
      }

      let getValue = (data) => {
        if (data.type === 'uri') {
          return {
            value: data.value.substr(data.value.lastIndexOf('/') + 1).replace(/_/g, ' '),
            uri: data.value
          }
        } else {
          return { value: data.value }
        }
      }
      // The length can't be less than 1
      if (val.length === 1) {
        return getValue(val[0])
      }
      // else if val.length > 1
      let result = []
      for (let i = 0; i < this.selectedPropertyMultiValueSelection.length; i++) {
        result.push(getValue(val[this.selectedPropertyMultiValueSelection[i]]))
      }
      return result
    },
    selectRecipe (key) {
      if (key === '') { return }
      let recipe = this.availableRecipes[key]
      this.recipeName = recipe.name
      this.recipeLabel = recipe.label || ''
      this.recipeScript = recipe.script
      this.recipeProperties = recipe.properties
      this.recipeResult = null
    },
    runCustomRecipe () {
      let that = this

      this.recipeResult = null
      this.isLoadingRecipeResult = true
      let formData = new FormData()
      formData.append('recipe', this.recipeScript)
      formData.append('rawData', JSON.stringify(this.recipeProperties.map(key => {
        return this.pageData[key]
      })))
      formData.append('data', JSON.stringify(this.recipeProperties.map(key => {
        return this.pageData[key][0].value
      })))
      this.$http.post('http://svm-kc1u16-test.ecs.soton.ac.uk:8888/custom', formData).then(res => {
        that.recipeResult = res.body
        that.isLoadingRecipeResult = false
      }, res => {
        that.recipeResult = res.body
        that.isLoadingRecipeResult = false
      })
    },
    getSuggestedRecipeValue () {
      let that = this
      this.suggestedRecipeResult = null
      this.isLoadingSuggestedRecipeResult = true
      let recipe = this.availableRecipes[this.selectedPropertySuggestion]
      let formData = new FormData()
      formData.append('recipe', recipe.script)
      formData.append('rawData', JSON.stringify(recipe.properties.map(key => {
        return that.pageData[key]
      })))
      formData.append('data', JSON.stringify(recipe.properties.map(key => {
        return that.pageData[key][0].value
      })))
      this.$http.post('http://svm-kc1u16-test.ecs.soton.ac.uk:8888/custom', formData).then(res => {
        that.suggestedRecipeResult = res.body
        that.isLoadingSuggestedRecipeResult = false
      }, res => {
        that.suggestedRecipeResult = res.body
        that.isLoadingSuggestedRecipeResult = false
      })
    },
    saveRecipe () {
      let newRecipeName = this.recipeName || 'Custom Recipe'
      let newRecipeLabel = this.recipeLabel || newRecipeName
      let recipes = this.$ls.get('recipes', {})
      if (this.selectedRecipe !== '') {
        Vue.delete(recipes, this.selectedRecipe)
      }
      this.selectedRecipe = this.recipeName
      this.$ls.set('recipes', {
        ...recipes,
        [newRecipeName]: {
          name: newRecipeName,
          label: newRecipeLabel,
          properties: [...this.recipeProperties],
          script: this.recipeScript
        }})
      const h = this.$createElement
      this.$notify({
        title: 'Recipe Saved',
        message: h('div', {},
          [
            'Recipe ',
            h('el-tag', { attrs: { type: 'primary' } }, newRecipeName),
            ' is saved.'
          ]),
        type: 'success'
      })
      this.refreshAvailableRecipe()
    },
    removeRecipe () {
      Vue.delete(this.availableRecipes, this.recipeName)
      this.propertySuggestionList.splice(this.propertySuggestionList.indexOf(this.recipeName), 1)
      let recipes = this.$ls.get('recipes', {})
      Vue.delete(recipes, this.recipeName)
      this.$ls.set('recipes', recipes)
      const h = this.$createElement
      this.$notify({
        title: 'Recipe Removed',
        message: h('div', {},
          [
            'Recipe ',
            h('el-tag', { attrs: { type: 'primary' } }, this.recipeName),
            ' is removed.'
          ]),
        type: 'success'
      })
      this.resetRecipe()
    },
    refreshAvailableRecipe () {
      let recipes = this.$ls.get('recipes', {})
      let that = this
      let availableRecipesKeys = Object.keys(recipes).filter(key => {
        for (let i = 0; i < recipes[key].properties.length; i++) {
          if (that.propertyList.indexOf(recipes[key].properties[i]) === -1) {
            return false
          }
        }
        return true
      })
      let _availableRecipes = {}
      for (let i = 0; i < availableRecipesKeys.length; i++) {
        _availableRecipes = {
          ..._availableRecipes,
          [availableRecipesKeys[i]]: recipes[availableRecipesKeys[i]]
        }
      }
      this.availableRecipes = _availableRecipes
    },
    resetRecipe () {
      this.recipeName = ''
      this.recipeLabel = ''
      this.recipeScript = ''
      this.recipeProperties = []
      this.selectedRecipe = ''
      this.recipeResult = null
    },
    getConfirmedContent () {
      let getValue = data => {
        if (data.uri === undefined) {
          return data.value
        }
        return `<a href="${data.uri}" target="blank">${data.value}</a>`
      }
      if (this.confirmedPropertyValue instanceof Array) {
        let result = ''
        for (let i = 0; i < this.confirmedPropertyValue.length; i++) {
          result += `${getValue(this.confirmedPropertyValue[i])}<br>`
        }
        return result
      }

      return getValue(this.confirmedPropertyValue)
    },
    getSimpleSentence () {
      let getValue = data => {
        if (data.uri === undefined) {
          return data.value
        }
        return `<a href="${data.uri}" target="blank">${data.value}</a>`
      }
      // - confirmedPropertyName
      //    If label available, use label; else, use property name
      let confirmedPropertyName = this.confirmedPropertyLabel || this.confirmedProperty
      if (this.confirmedPropertyValue instanceof Array) {
        if (this.confirmedPropertyValue.length > 1) {
          let result = `The ${pluralize(confirmedPropertyName)} of ${this.pentity} are `
          for (let i = 0; i < this.confirmedPropertyValue.length; i++) {
            let val = getValue(this.confirmedPropertyValue[i])
            if (i === 0) {
              result += `${val}`
            } else if (i === this.confirmedPropertyValue.length - 1) {
              result += `, and ${val}.`
            } else {
              result += `, ${val}`
            }
          }
          return result
        } else {
          return `The ${pluralize.singular(confirmedPropertyName)} of ${this.pentity} is ${getValue(this.confirmedPropertyValue[0])}.`
        }
      }
      return `The ${pluralize.singular(confirmedPropertyName)} of ${this.pentity} is ${getValue(this.confirmedPropertyValue)}.`
    },
    toast (e, msg = 'Copied!', type = 'success') {
      this.$message({
        message: msg,
        type: type
      })
    },
    notifyPotentialPriorityRule (pair) {
      if (pair.length !== 2) { return }

      const h = this.$createElement
      this.$notify({
        title: 'Potential Priority Rule',
        message: h('div', {},
          [
            'Detected potential rule between ',
            h('el-tag', { attrs: { type: 'primary' } }, pair[0]),
            ' and ',
            h('el-tag', { attrs: { type: 'primary' } }, pair[1]),
            '. Click ',
            h('el-button', {
              attrs: { type: 'text', size: 'mini' },
              on: {
                click: () => {
                  this.$store.commit(UPDATE_PPR_PAIR, pair)
                  this.$store.commit(UPDATE_PPR_DIALOG_VISIBILITY, true)
                }
              }
            }, 'here'),
            ' to continue.']),
        duration: 15000
      })
    },
    viewAlias () {
      this.$alert('Available alias', `Alias of entity: ${this.pentity}`, {
        confirmButtonText: 'OK',
        callback: action => {
          this.$message({
            type: 'info',
            message: `action: ${action}`
          })
        }
      })
    },
    loadReplacingPair (name) {
      this.replacingPairState = 'loading'

      let that = this
      let formData = new FormData()
      formData.append('entity_name', name)
      formData.append('property_name', this.pproperty)
      Vue.http.post('http://10.7.6.213:8888/replacingPair', formData).then(res => {
        // Reset related data
        that.resetData()
        that.replacingPair = res.body
        // Generate property & suggestion data
        that.generateData()
        that.replacingPairState = 'success'
      }, res => {
        that.replacingPairState = 'fail'
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #1f2d3d;
}
.error {
  color: red;
}
.clearfix {
  clear: both;
}
.label {
  clear: both;
  font-size: 12px;
  color: #8492A6;
}
.el-select {
  width: 100%;
}
hr {
  border-top: 0.5px dashed #8492A6;
  clear: both;
}
.button-group {
  float: right;
  padding: 16px 0px 4px 0px;
}
.text-box-title {
  color: #8492A6;
  font-weight: bold;
}
.text-box {
  width: 176px;
  max-height: 120px;
  border: 1px solid #dfe6ec;
  padding: 8px;
  border-radius: 5px;
  overflow: scroll;
}
.hljs {
  background: white;
  overflow: visible;
  margin-top: -30px;
  margin-bottom: -43px;
  line-height: 1;
}
.el-collapse-item__header {
  color: #1f2d3d;
}
.el-transfer-panel {
  width: 100%;
}
.el-transfer__buttons {
  width: 100%;
  padding: 10px 0;
  display: flex;
}
.el-transfer__buttons .el-button {
  transform: rotate(90deg);
}
.el-transfer__buttons .el-button:first-child {
  margin-bottom: 0;
}
.el-checkbox {
  margin-left: 0;
  display: block;
}
</style>
