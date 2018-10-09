Foundation.Abide.defaults.patterns['NRIC'] = /^[A-Z]{1}[0-9]{7}[A-Z]{1}$/;
Foundation.Abide.defaults.patterns['Mobile'] =/^\+{0,1}\d{8,}$/;
var CurrentID=0;
$(document).foundation();
$(function(){
  //get cookie & loginID
  var appCookie = Cookies.getJSON('appCookie'),
      loginID = appCookie.loginID;
    // save data
    $('#submit').click(function(){
      SaveAccessibleTransitMobilityAssistance();
    });
    //get data
    $.when(formSectionsInit(),formOthersInit(),GetRelationship('.sectionB_relationship'),GetDropdownList('#sectionC_NameHospital', 'MembershipHospital')).then(function(){
      var ID= '';
      ID=GetQueryString('ID');
      if (ID.length>0) {
        GetAccessibleTransitMobilityAssistance(ID)
      }
    });
     $('[name=sectionC_PurposeTransport]').each(function(index, el) {
       $(el).change(function(){
          var val=$(el).val();
          var checked=$(el).prop('checked');
          if (index==0) {
             checked?($('#SECTIONC1').show()):($('#SECTIONC1').hide())
          }
          else if (index==1){
              checked?($('#SECTIONC2').show()):($('#SECTIONC2').hide())
          }


       })
     });
      $('#sectionA_PostalCode').blur(function () {
      if ($(this).val() !== '') {
            GetAddress();
      }
      });
});
//geneare drop down optioms
function GetDropdownList(id, category) {
  var data = {
    'LookupCat': category
  };
  $.ajax({
    url: apiSrc + "BCMain/iCtc1.Lookup_Get.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i = 0; i < lookup.length; i++) {
            $(id).append('<option value="' + lookup[i].LookupKey + '">' + lookup[i].Description + '</option>');
          }
        }
      } else {
        alert(data.d.RetMsg);
      }
    }
  });
}

 function GetAddress() {
       var data = { 'Country': 'Singapore', 'PostalCode': $('#sectionA_PostalCode').val() };
       $.ajax({
           url: apiSrc + "BCMain/iCtc1.GetAddressByPostalCode.json",
           method: "POST",
           dataType: "json",
           xhrFields: { withCredentials: true },
           data: {
               'data': JSON.stringify(data),
               'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
               'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
           },
           success: function (data) {
               if ((data) && (data.d.RetVal === -1)) {
                   if (data.d.RetData.Tbl.Rows.length > 0) {
                       var ResultA = data.d.RetData.Tbl.Rows[0];
                       $('#sectionA_HouseBlock').val(ResultA.AddrP1);
                       $('#sectionA_Level').val(ResultA.AddrP2);
                       $('#sectionA_StreetName').val(ResultA.AddrP3);
                       $('#sectionA_BuildingName').val(ResultA.AddrP4);

                   }
               }
           }
       });

   }

//get url param
function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
}
//get data
function GetAccessibleTransitMobilityAssistance(ID) {
      var data = { 'ID': ID };
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.GetAccessibleTransitMobilityForm.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      var AccessibleTransit = data.d.RetData.Tbl.Rows[0];
                      CurrentID=AccessibleTransit.ID||0;
                      $('#sectionA_Ordinary').prop('checked',true);
                      $('#GroupIDDiv').show();$('#GroupID').val(AccessibleTransit.GroupID||'');

                      $('#sectionA_FamilyName').val(AccessibleTransit.SectionAFamilyName || '')
                      $('#sectionA_GivenName').val(AccessibleTransit.SectionAGivenName|| '')
                      $('#sectionA_DisplayName').val(AccessibleTransit.SectionADisplayName|| '')
                      $('#sectionA_nric').val(AccessibleTransit.SectionANRIC|| '')
                      $('#sectionA_dateOfBirth').val(AccessibleTransit.SectionABirth|| '')
                      $('#sectionA_home').val(AccessibleTransit.SectionATelNoHome|| '')
                      $('#sectionA_office').val(AccessibleTransit.SectionATelNoOffice|| '')
                      $('#sectionA_mobile').val(AccessibleTransit.SectionAHandphone|| '')
                      $('#sectionA_email').val(AccessibleTransit.SectionAEmail|| '')


                      $('#sectionA_PostalCode').val(AccessibleTransit.SectionAPostalCode|| '')
                      $('#sectionA_BlockNo').val(AccessibleTransit.SectionABlockNo|| '')
                      $('#sectionA_Level').val(AccessibleTransit.SectionALevelUnit|| '')
                      $('#sectionA_BuildingName').val(AccessibleTransit.SectionABuildingName|| '')
                      $('#sectionA_StreetName').val(AccessibleTransit.SectionAStreetName|| '')


                      $('#sectionB_FamilyName').val(AccessibleTransit.SectionBFamilyName || '')
                      $('#sectionB_GivenName').val(AccessibleTransit.SectionBGivenName|| '')
                      $('#sectionB_DisplayName').val(AccessibleTransit.SectionBDisplayName|| '')
                      $('#sectionB_nric').val(AccessibleTransit.SectionBNRIC|| '')
                      $('#sectionB_dateOfBirth').val(AccessibleTransit.SectionBBirth|| '')
                      $('#sectionB_home').val(AccessibleTransit.SectionBHandphone|| '')
                      $('#sectionB_office').val(AccessibleTransit.SectionBTelNoHome|| '')
                      $('#sectionB_mobile').val(AccessibleTransit.SectionBTelNoOffice|| '')
                      $('#sectionB_relationship').val(AccessibleTransit.SectionBRelationship|| '')
                      $('#sectionB_email').val(AccessibleTransit.SectionBEmail|| '')



                      var sectionC_PurposeTransport=AccessibleTransit.SectionCPurposeTransport || '';
                      var sectionC_PurposeTransportArr = sectionC_PurposeTransport.split(',');
                      for (var i = 0; i < sectionC_PurposeTransportArr.length; i++) {
                          if (sectionC_PurposeTransportArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionC_PurposeTransport"]').each(function () {
                                  if ($(this).val() == sectionC_PurposeTransportArr[i]) { $(this).prop('checked', true); }
                              });
                          }
                      }
                      if (sectionC_PurposeTransport.lastIndexOf("for Schooling")>-1) {
                        $('#SECTIONC1').show();
                      }
                      if (sectionC_PurposeTransport.lastIndexOf("for Medical Consultation")>-1) {
                         $('#SECTIONC2').show();
                      }

                      var sectionC_ModeTransport = AccessibleTransit.SectionCModeTransport || '';
                      if (sectionC_ModeTransport.length > 0) {

                          var sectionC_ModeTransportArr = sectionC_ModeTransport.split(',');
                          var OthersectionC_ModeTransport = '';

                          for (var i = 0; i < sectionC_ModeTransportArr.length; i++) {
                              if (sectionC_ModeTransportArr[i].length > 0) {
                                  var flag = false;
                                  $('input[name="sectionC_ModeTransport"]').each(function () {
                                      if ($(this).val() == sectionC_ModeTransportArr[i]) { $(this).prop('checked', true); flag = true; }
                                  });
                                  if (flag == false) {
                                      OthersectionC_ModeTransport += sectionC_ModeTransportArr[i] + ' ';
                                  }
                              }

                          }
                          if (OthersectionC_ModeTransport.length > 0) {
                              $('#sectionC_ModeTransportOtherText').val(OthersectionC_ModeTransport);
                              $('input[name="sectionC_ModeTransport"]').each(function () {
                                  if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                              });
                          }
                      }
                      $('#sectionC_NameSchool').val(AccessibleTransit.SectionCNameSchool|| '')
                      $('#sectionC_LocationSchool').val(AccessibleTransit.SectionCLocationSchool|| '')

                      var sectionC_NumberTripsDay=AccessibleTransit.SectionCNumberTripsDay||'';
                      if (sectionC_NumberTripsDay== 'One') {
                        $('#sectionC_NumberTripsDayOne').prop('checked', true)
                      }else if(sectionC_NumberTripsDay == 'Two'){
                          $('#sectionC_NumberTripsDayTwo').prop('checked', true)
                      }else {

                      }
                      $('#sectionC_TransportCostC1').val(AccessibleTransit.SectionCTransportCostC1|| '')
                      $('#sectionC_NumberTripsWeek').val(AccessibleTransit.SectionCNumberTripsWeek|| '')
                      $('#sectionC_TransportCostMonth').val(AccessibleTransit.SectionCTransportCostMonth|| '')
                      $('#sectionC_NameHospital').val(AccessibleTransit.SectionCNameHospital|| '')
                      $('#sectionC_TransportCostC2').val(AccessibleTransit.SectionCTransportCostC2|| '')
                      $('#sectionC_PurposeConsultation').val(AccessibleTransit.SectionCPurposeConsultation|| '')
                      $('#sectionC_PurposeFrequency').val(AccessibleTransit.SectionCPurposeFrequency|| '')

                      var sectionD_validMean=AccessibleTransit.SectionDvalidMean||'';
                      if (sectionD_validMean== '1') {
                        $('#sectionD_validMeanYes').prop('checked', true)
                      }else if(sectionD_validMean == '0'){
                          $('#sectionD_validMeanNo').prop('checked', true)
                      }else {

                      }
                      var SectionDSimilarSupport= AccessibleTransit.SectionDSimilarSupport||'';
                      if (SectionDSimilarSupport.length>0) {
                        if (SectionDSimilarSupport == '0') {
                            $('#sectionD_SimilarSupportNo').prop('checked', true)
                        }else {
                          $('#sectionD_SimilarSupportYes').prop('checked', true)
                          $('#sectionD_SourceFunding').val(SectionDSimilarSupport)
                        }

                      }
                      $('#sectionC_PurposeConsultation2').val(AccessibleTransit.sectionCPurposeConsultation2||'');
                      $('#sectionC_PurposeFrequency2').val(AccessibleTransit.sectionCPurposeFrequency2||'');
                      $('#sectionC_PurposeConsultation3').val(AccessibleTransit.sectionCPurposeConsultation3||'');
                      $('#sectionC_PurposeFrequency3').val(AccessibleTransit.sectionCPurposeFrequency3||'');

                      var sectionE_ProtectionDeclaration=AccessibleTransit.SectionEProtectionDeclaration || '';
                      var sectionE_ProtectionDeclarationArr = sectionE_ProtectionDeclaration.split(',');
                      for (var i = 0; i < sectionE_ProtectionDeclarationArr.length; i++) {
                          if (sectionE_ProtectionDeclarationArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionE_ProtectionDeclaration"]').each(function () {
                                  if ($(this).val() == sectionE_ProtectionDeclarationArr[i]) { $(this).prop('checked', true); }
                              });
                          }
                      }
                      var sectionE_ApplicantDeclaration=AccessibleTransit.SectionEApplicantDeclaration || '';
                      var sectionE_ApplicantDeclarationArr = sectionE_ApplicantDeclaration.split(',');
                      for (var i = 0; i < sectionE_ApplicantDeclarationArr.length; i++) {
                          if (sectionE_ApplicantDeclarationArr[i].length > 0) {
                              $('input[name="sectionE_ApplicantDeclaration"]').each(function () {
                                  if ($(this).val() == sectionE_ApplicantDeclarationArr[i]) { $(this).prop('checked', true); }
                              });
                          }
                      }
                      $('#sectionE_MainName').val(AccessibleTransit.SectionEMainName|| '')
                      $('#sectionE_MainSignature').val(AccessibleTransit.SectionEMainSignature|| '')
                      $('#sectionE_MainDate').val(AccessibleTransit.SectionEMainDate|| '')
                      $('#sectionE_MemberName').val(AccessibleTransit.SectionEMemberName|| '')
                      $('#sectionE_MemberSignature').val(AccessibleTransit.SectionEMemberSignature|| '')
                      $('#sectionE_MemberDate').val(AccessibleTransit.SectionEMemberDate|| '')
                      $('#sectionE_ReceivedOn').val(AccessibleTransit.SectionEReceivedOn|| '')
                      $('#sectionE_AssessmentOn').val(AccessibleTransit.SectionEAssessmentOn|| '')
                      $('#sectionE_Recommendation').val(AccessibleTransit.SectionERecommendation|| '')
                      $('#sectionE_ApprovedOn').val(AccessibleTransit.SectionEApprovedOn|| '')
                      $('#sectionE_ProcessedBy').val(AccessibleTransit.SectionEProcessedBy|| '')
                      $('#sectionE_Assessor').val(AccessibleTransit.SectionEAssessor|| '')
                      $('#sectionE_CommenceOn').val(AccessibleTransit.SectionECommenceOn|| '')
                      $('#sectionE_CaseNote').val(AccessibleTransit.SectionECaseNote|| '')



                  }
              }
          }
      });
  }





function formSectionValidate(form,isAll) {
  var result=0;
  if (!isAll) {
      $(form).find('fieldset:hidden :input,select').attr('disabled','disabled');
  }
  $(form).on('formvalid.zf.abide',function(){result=1;});
  $(form).foundation('validateForm');
  $(form).find('fieldset :input').removeAttr('disabled');
  return result;
}

function LoadDataByordinaryNo(OrdinaryNo){
    $.ajax({
    url: apiSrc + "BCMain/iCtc1.GetAccessMemberShipByGroupID.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify({'GroupID':OrdinaryNo}),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        //section a
        if (data.d.RetData.Tbls[0].Rows.length>0) {
           var row=data.d.RetData.Tbls[0].Rows[0];
           for (e in row){
           $('#section'+e).val(row[e]);
           }
        }
          //section b
        if (data.d.RetData.Tbls[1].Rows.length>0) {
          var row=data.d.RetData.Tbls[1].Rows[0];
           for (e in row){
             $('#section'+e).val(row[e]);
           }
        }
      } else {
        alert(data.d.RetMsg);
      }
    }
  });
}
function GetRelationship(sel) {
  $.ajax({
    url: apiSrc + "BCMain/iCtc1.SearchRelationshipType.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify({}),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i = 0; i < lookup.length; i++) {
            $(sel).append('<option value="' + lookup[i].RelationshipAB + '">' + lookup[i].RelationshipAB  + '</option>');
          }
        }
      } else {
        alert(data.d.RetMsg);
      }
    }
  });
}
function formOthersInit() {
  $('[data-form-other-text=true]').prop('readonly','readonly');
  $('[data-form-other]').each(function(){
    var thisObj = $(this);
    var targetVal = thisObj.data('form-other');
    var targetObj = $('#' + targetVal);
    var target = $('#' + targetVal);


    if (thisObj.prop('type')=='checkbox') {
      //console.log('checkbox');
      thisObj.click(function() {
        if (thisObj.is(':checked')) {
          targetObj.prop('readonly','');
        }
        else {
          targetObj.val('');
          targetObj.prop('readonly','readonly');
        }
      });
    }
    else if (thisObj.prop('type') == 'radio') {
      var radioName = thisObj.prop('name');
      var thisVal = thisObj.val();
      var radioGroup = $('[name='+radioName+']');

      radioGroup.click(function() {

        if ($('[name='+radioName+']:checked').val() == thisVal) {
          targetObj.prop('readonly','');
        }
        else {
          targetObj.val('');
          targetObj.prop('readonly','readonly');
        }
      });
    }
    else if (thisObj.is('select')) {
      thisObj.change(function() {
        var thisVal = thisObj.val();
        //console.log('select');
        if (thisVal.toLowerCase()=='other' || thisVal.toLowerCase()=='others') {
          targetObj.prop('readonly','');
        }
        else {
          targetObj.val('');
          targetObj.prop('readonly','readonly');
        }
      });
    }
  });
}


function formSectionsInit() {
  $('form.formSection').each(function() {
    var form = $(this);
    var fieldsets = form.find('fieldset');
    var breadcrumbs = form.find('.breadcrumbs');
    var footer = form.find('footer.buttonsGroup');

    form.data('current-form-index',0);

    breadcrumbs.html('');

    fieldsets.each(function(index) {

      var fieldset = $(this);
      fieldset.data('fieldset-index',index);
      breadcrumbs.append('<li><a href="#'+fieldset.prop('id')+'" data-fieldset-index="'+index+'">'+fieldset.find('h2').html()+'</a>').find('li:eq(0) a').addClass('active');

      if(index>0) {
        fieldset.hide();
      }
    });

    breadcrumbs.find('a').click(function() {
      var thisObj = $(this);
      var currentIndex = parseInt(form.data('current-form-index'));
      if (formSectionValidate(form,0) ) {
        loadFormSection(thisObj.data('fieldset-index'));
      }
      return false;
    });

    //set buttons
    footer.find('#previous').hide();
    footer.find('[class*=submit]').hide();

    footer.find('#previous').click(function() {
      var currentIndex = parseInt(form.data('current-form-index'));
      var targetIndex = currentIndex-1;

      if (targetIndex <0) targetIndex=0;

      if (formSectionValidate(form,0) ) {
        loadFormSection(targetIndex);
      }
      return false;
    });
    footer.find('#next').click(function() {
        if (formSectionValidate(form,0)) {
          var targetIndex = parseInt(form.data('current-form-index')) + 1;
          if (targetIndex >= fieldsets.length) targetIndex=fieldsets.length-1;
          loadFormSection(targetIndex);
        }
        return false;
    });
    function loadFormSection(index) {
      //set index
      form.data('current-form-index', index);
      var targetIndex = index;

      breadcrumbs.find('a').removeClass('active').filter(function() {
        return ($(this).data('fieldset-index') == targetIndex);
      }).addClass('active');

      //set fieldset`
      fieldsets.hide().filter(function() {
        return ($(this).data('fieldset-index') == targetIndex);
      }).show();

      if (index == 0) {
        footer.find('#previous').hide();
        footer.find('#next').show();
        footer.find('[class*=submit]').hide();
      }
      else if (index == fieldsets.length-1) {
        footer.find('#previous').show();
        footer.find('#next').hide();
        footer.find('[class*=submit]').show();
      }
      else {
        footer.find('#previous').show();
        footer.find('#next').show();
        footer.find('[class*=submit]').hide();
      }
    }
  });
}


// save initial-assesment-form
function SaveAccessibleTransitMobilityAssistance(){
  if (!formSectionValidate($('#pageContentWrapper'),1)) {
  return false;
}
  var data={};
  data['ID'] = CurrentID;
  $('#pageContentWrapper :input,select').each(function(){
    var type=$(this).attr('type'), name= $(this).attr('name'),val=$(this).val();
    if (type=="radio") { val=$(':input[type="'+type+'"][name="'+name+'"]:checked').val()||'';};
    if (type=="checkbox") {
      var tempVal='';
      $(':input[type="'+type+'"][name="'+name+'"]').each(function(index,item){
        if ($(item).prop('checked')==true) {
          tempVal+=$(item).val()+',';
        }
      });
      val=(tempVal.length>0?tempVal.substr(0,tempVal.length-1):'');
    };
    if ((!data.hasOwnProperty(data[name]))&&name) {
      data[name]=val;
    }
  });

  $.ajax({
    url: apiSrc+"BCMain/iCtc1.SaveAccessibleTransitMobility.json",
    method: "POST",
    dataType: "json",
    xhrFields: { withCredentials: true },
    data: { 'data': JSON.stringify(data),
            'WebPartKey':'021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277' },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            alert('Successfully updated!');
            location.reload();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown){
      alert("Error: " + errorThrown);
    }
  })
}
