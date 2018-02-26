/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import AlgebraicType = require('../algebraic-type');
import AlgebraicTypeUtils = require('../algebraic-type-utils');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import FunctionUtils = require('../function-utils');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import StringUtils = require('../string-utils');

function matchingFileNameForAlgebraicType(algebraicType:AlgebraicType.Type):string {
  return algebraicType.name + 'FunctionMatchingUtils';
}

function instanceMethodKeywordsForMatchingSubtypesOfAlgebraicType(algebraicType:AlgebraicType.Type):ObjC.Keyword[] {
  const firstKeyword:ObjC.Keyword = AlgebraicTypeUtils.firstKeywordForMatchMethodFromSubtype(algebraicType, Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(), algebraicType.subtypes[0]);
  const additionalKeywords:ObjC.Keyword[] = algebraicType.subtypes.slice(1).map(FunctionUtils.pApply2f3(algebraicType, Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(), AlgebraicTypeUtils.keywordForMatchMethodFromSubtype));
  return [firstKeyword].concat(additionalKeywords);
}

function blockInvocationWithNilCheckForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string[] {
  return ['if (' + AlgebraicTypeUtils.blockParameterNameForMatchMethodFromSubtype(subtype) + ') {', StringUtils.indent(2)(blockInvocationForSubtype(algebraicType, subtype)), '}'];
}

function blockInvocationForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string {
  return AlgebraicTypeUtils.blockParameterNameForMatchMethodFromSubtype(subtype) + '(' + AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, AlgebraicTypeUtils.valueAccessorForInternalPropertyForAttribute)).join(', ') + ');';
}

function matcherCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  return AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType, AlgebraicTypeUtils.valueAccessorForInternalPropertyStoringSubtype(), blockInvocationWithNilCheckForSubtype);
}

function instanceMethodForMatchingSubtypesOfAlgebraicType(algebraicType:AlgebraicType.Type):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Nothing<string>(),
    code: matcherCodeForAlgebraicType(algebraicType),
    comments: [],
    compilerAttributes:[],
    keywords: instanceMethodKeywordsForMatchingSubtypesOfAlgebraicType(algebraicType),
    returnType: {
      type: Maybe.Nothing<ObjC.Type>(),
      modifiers: []
    }
  };
}

export function createAlgebraicTypePlugin():AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType:AlgebraicType.Type):Code.File[] {
      return [];
    },
    blockTypes: function(algebraicType:AlgebraicType.Type):ObjC.BlockType[] {
      return algebraicType.subtypes.map(FunctionUtils.pApply2f3(algebraicType, Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(), AlgebraicTypeUtils.blockTypeForSubtype));
    },
    classMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [];
    },
    enumerations: function(algebraicType:AlgebraicType.Type):ObjC.Enumeration[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(algebraicType:AlgebraicType.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(algebraicType:AlgebraicType.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [instanceMethodForMatchingSubtypesOfAlgebraicType(algebraicType)];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['FunctionMatching'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      return [];
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(algebraicType:AlgebraicType.Type):boolean {
      return false;
    },
  };
}
