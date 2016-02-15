<script id="templates/results.html" type="text/ng-template">
  <ion-modal-view>
    <ion-header-bar class="bar-stable">
      <h1 class="title">Ergebnisse</h1>
    </ion-header-bar>
    <ion-content class="padding">
      <!-- Bild fuer Analyse -->
      <div>
        <img ng-src="{{ pic }}" class="selPicture" style="max-width:100%">
      </div>

      <!-- Ergebnisliste nach Watsonaufruf -->
      <div class="">
        Ergebnisse
        <ion-list class="list-inset">
          <ion-item ng-repeat="result in results | orderBy: &apos;-label_score&apos; | limitTo: 3 ">
            {{ result.label_name }} ({{ result.label_score }}) <small>{{ result.label_source }}</small>
            <a href="" ng-click="result.play()" text-to-speech="result" style="display:none;float:right;">Play</a>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-modal-view>
</script>
